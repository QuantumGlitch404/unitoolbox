
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

const flattenObject = (obj: any, prefix: string = ''): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newPrefix));
      } else if (Array.isArray(obj[key])) {
        result[newPrefix] = JSON.stringify(obj[key]);
      } else {
        result[newPrefix] = obj[key];
      }
    }
  }
  return result;
};

const convertJsonToCsv = (jsonData: any): string => {
  let dataArray: any[];

  // If jsonData is an object with a single key whose value is an array,
  // use that inner array as the basis for CSV rows.
  if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
    const keys = Object.keys(jsonData);
    if (keys.length === 1 && Array.isArray(jsonData[keys[0]])) {
      dataArray = jsonData[keys[0]]; // Use the array of items (e.g., students)
    } else {
      dataArray = [jsonData]; // Treat the single complex object as one row
    }
  } else if (Array.isArray(jsonData)) {
    dataArray = jsonData; // It's already an array of objects
  } else {
    // Handle primitive JSON values (string, number, boolean, null)
    if (jsonData === null) {
      throw new Error("Input JSON 'null' cannot be meaningfully converted to CSV. Please provide an array of objects or a single object.");
    }
    // For other primitives, create a single-value CSV
    return `value\n${escapeCsvCell(jsonData)}`;
  }
  
  if (dataArray.length === 0) {
    return ''; // Return empty string for empty JSON array [] or {"key": []}
  }

  // Flatten each object in the dataArray
  const flattenedData = dataArray.map(item => {
    if (typeof item === 'object' && item !== null) {
      return flattenObject(item);
    }
    // If an item in the array is not an object (e.g., [1, "a", {"k":"v"}]),
    // wrap it to have a 'value' key for consistent processing.
    return { 'value': item }; 
  });

  // Collect all unique headers from the flattened data
  const headersSet = new Set<string>();
  flattenedData.forEach(obj => {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => headersSet.add(key));
    }
  });
  const headers = Array.from(headersSet).sort(); // Sort headers alphabetically for consistency

  // Special case: if the original JSON was a simple array of primitives (e.g. [1,2,3])
  // which became [{value:1},{value:2},{value:3}], the header should be 'value'.
  if (headers.length === 1 && headers[0] === 'value' && 
      flattenedData.every(item => typeof item === 'object' && item !== null && Object.keys(item).length === 1 && 'value' in item)) {
      const csvRows = [
        "value", // Header
        ...flattenedData.map(rowObj => escapeCsvCell(rowObj.value)) // Rows
      ];
      return csvRows.join('\n');
  }

  // If headers is empty (e.g., from input `[{}, null]` which becomes `[{ }, {value: null}]`),
  // produce CSV with no headers and appropriate number of empty lines.
  if (headers.length === 0) {
    return flattenedData.map(() => "").join('\n'); // Each item results in a blank line if no headers.
  }

  // Construct CSV rows
  const csvRows = [
    headers.map(header => escapeCsvCell(header)).join(','), // Header row
    ...flattenedData.map(obj =>
      headers.map(header => escapeCsvCell(obj ? obj[header] : '')).join(',') // Data rows
    )
  ];

  return csvRows.join('\n');
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
      let errorMessage = "Failed to convert JSON to CSV. Please check the data format and structure. Some complex structures might not be ideally representable in CSV.";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      setCsvData(null);
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
                    placeholder='Paste your JSON data here. e.g., [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 24}] or {"items": [{"id":1, "value":"A"}]}'
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
            <CardDescription>Review your CSV data below. You can copy or download it.</CardDescription>
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
