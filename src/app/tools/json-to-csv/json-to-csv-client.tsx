
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileJson as FileJsonIcon, Download, Copy } from 'lucide-react';

const escapeCsvCell = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const convertJsonToCsv = (jsonData: any): string => {
  let topLevelArray: any[];

  if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
    const keys = Object.keys(jsonData);
    if (keys.length === 1 && Array.isArray(jsonData[keys[0]])) {
      topLevelArray = jsonData[keys[0]];
    } else {
      topLevelArray = [jsonData]; // Treat single object as an array of one
    }
  } else if (Array.isArray(jsonData)) {
    topLevelArray = jsonData;
  } else {
    if (jsonData === null) throw new Error("Input JSON 'null' cannot be meaningfully converted to CSV. Please provide an array of objects or a single object.");
    return `value\n${escapeCsvCell(jsonData)}`; // Primitive JSON value
  }

  if (topLevelArray.length === 0) return '';

  const allHeaders = new Set<string>();
  const resultRows: Record<string, any>[] = [];

  // Flattens an object, used for nested structures NOT chosen for row expansion
  function flattenSubObject(obj: any, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix + key;
        const value = obj[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(result, flattenSubObject(value, newKey + '.'));
        } else if (Array.isArray(value)) {
          result[newKey] = JSON.stringify(value); // Stringify arrays encountered during sub-flattening
        } else {
          result[newKey] = value;
        }
      }
    }
    return result;
  }

  // Recursive function to process each record, potentially expanding one array of objects
  function processRecord(currentRecord: any, parentData: Record<string, any>, prefixForChildren: string = '') {
    const simpleProps: Record<string, any> = {};
    let arrayToExpandInfo: { originalKeyName: string, data: any[] } | null = null;

    // Separate simple properties and the first eligible array of objects for expansion
    for (const key in currentRecord) {
      if (Object.prototype.hasOwnProperty.call(currentRecord, key)) {
        const value = currentRecord[key];
        const fullPropKey = prefixForChildren + key;

        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && !arrayToExpandInfo) {
          arrayToExpandInfo = { originalKeyName: key, data: value };
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Nested object (not an array of objects, or not the first one)
          Object.assign(simpleProps, flattenSubObject(value, fullPropKey + '.'));
        } else {
          // Primitive, or array of primitives/mixed (stringified), or subsequent array of objects (stringified)
          if(Array.isArray(value)) {
            simpleProps[fullPropKey] = JSON.stringify(value);
          } else {
            simpleProps[fullPropKey] = value;
          }
        }
      }
    }

    const currentRowBaseData = { ...parentData, ...simpleProps };

    if (arrayToExpandInfo) {
      // Expand this array: for each item in arrayToExpand, create a new branch of processing
      const subPrefix = prefixForChildren + arrayToExpandInfo.originalKeyName + '.';
      if (arrayToExpandInfo.data.length === 0) { // Empty array to expand, create one row with existing data
        Object.keys(currentRowBaseData).forEach(header => allHeaders.add(header));
        resultRows.push(currentRowBaseData);
      } else {
        arrayToExpandInfo.data.forEach(subItem => {
          processRecord(subItem, currentRowBaseData, subPrefix);
        });
      }
    } else {
      // This is a "leaf" row in terms of expansion. Add it to results.
      Object.keys(currentRowBaseData).forEach(header => allHeaders.add(header));
      resultRows.push(currentRowBaseData);
    }
  }

  topLevelArray.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      processRecord(item, {}, '');
    } else { // Handle array of primitives like [1, "a", null]
      const row = { 'value': item };
      allHeaders.add('value');
      resultRows.push(row);
    }
  });
  
  // Handle cases like `[]` or `[{}]` or `[null]` more gracefully.
  if (resultRows.length === 0 && topLevelArray.length > 0) { // e.g. `[null]` or `[undefined]`
     if (topLevelArray.every(item => item === null || item === undefined)) {
        allHeaders.add('value'); // give a header for consistency
        topLevelArray.forEach(() => resultRows.push({ 'value': '' }));
     }
  }
  if (allHeaders.size === 0 && resultRows.length > 0 && Object.keys(resultRows[0]).length === 0) {
    // e.g. input was [{}] - resultRows might be [{}]
    // This case might not need a header if truly empty objects
    return resultRows.map(() => "").join('\n'); // return blank lines
  }
   if (allHeaders.size === 0 && resultRows.length === 0 && topLevelArray.length > 0) {
    // e.g. input was `[[], {}]` where inner array isn't object array
    // Fallback: this might mean simple array of simple items without 'value' key logic hitting earlier
    return ''; // Or handle as per array of primitives
  }


  const sortedHeaders = Array.from(allHeaders).sort();

  // If after all processing, there are no headers but there were rows (e.g. from input like [{}, {}]),
  // it means empty objects. Produce blank lines for CSV.
  if (sortedHeaders.length === 0 && resultRows.length > 0) {
      return resultRows.map(row => "").join('\n');
  }
  // If there are no headers and no rows (e.g. from input `[]`), return empty string.
  if (sortedHeaders.length === 0 && resultRows.length === 0) {
      return '';
  }


  const headerRow = sortedHeaders.map(header => escapeCsvCell(header)).join(',');
  const dataRows = resultRows.map(row =>
    sortedHeaders.map(header => escapeCsvCell(row[header])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
};


const formSchema = z.object({
  jsonData: z.string().min(1, "JSON data cannot be empty.")
    .refine(data => {
      try {
        JSON.parse(data);
        return true;
      } catch {
        return false;
      }
    }, "Invalid JSON format."),
});

type JsonToCsvFormData = z.infer<typeof formSchema>;

export function JsonToCsvClient() {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<JsonToCsvFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jsonData: "",
    },
  });

  const onSubmit: SubmitHandler<JsonToCsvFormData> = async (data) => {
    setIsLoading(true);
    setCsvData(null);
    
    try {
      const parsedJson = JSON.parse(data.jsonData);
      const generatedCsv = convertJsonToCsv(parsedJson);
      setCsvData(generatedCsv);
      
      toast({
        title: "Conversion Successful!",
        description: "JSON data has been converted to CSV.",
      });
    } catch (error: any) {
      console.error("Error converting JSON to CSV:", error);
      let errorMessage = "Failed to convert JSON. Check format/structure. Arrays of objects are denormalized (one row per sub-item).";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      setCsvData(null); // Clear previous CSV data on error
      toast({
        title: "Conversion Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyCsv = () => {
    if (csvData && csvData.trim() !== "") {
      navigator.clipboard.writeText(csvData)
        .then(() => toast({ title: "Copied!", description: "CSV data copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy CSV data.", variant: "destructive" }));
    } else {
       toast({ title: "Nothing to Copy", description: "CSV output is empty.", variant: "default"});
    }
  };

  const handleDownloadCsv = () => {
    if (csvData && csvData.trim() !== "") {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "converted_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); 
      toast({ title: "Download Started", description: "CSV file download initiated." });
    } else {
      toast({ title: "Nothing to Download", description: "CSV output is empty.", variant: "default"});
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="jsonData"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">JSON Data</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Paste JSON. e.g., {"items": [{"id":1, "name":"A", "details":[{"type":"X"}]}]} or [{"id":1, "val":"A"}]'
                    className="min-h-[200px] resize-y text-base font-code"
                    {...field}
                    aria-label="JSON input area"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileJsonIcon className="mr-2 h-4 w-4" />
            )}
            Convert to CSV
          </Button>
        </form>
      </Form>

      {csvData !== null && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated CSV Data</CardTitle>
            <CardDescription>Review your CSV data. Arrays of objects are expanded into multiple rows.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={csvData} 
              readOnly
              className="min-h-[200px] resize-y text-base font-code bg-background/50"
              aria-label="Generated CSV output"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handleCopyCsv} variant="outline" size="sm" disabled={!csvData && csvData !== ""}>
                <Copy className="mr-2 h-4 w-4" /> Copy CSV
              </Button>
              <Button onClick={handleDownloadCsv} variant="outline" size="sm" disabled={!csvData && csvData !== ""}>
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

