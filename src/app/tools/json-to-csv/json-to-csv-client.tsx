
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
  // If the stringValue contains a comma, a double quote, or a newline/carriage return character
  if (/[",\r\n]/.test(stringValue)) {
    // Enclose in double quotes and replace any internal double quotes with two double quotes
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
        result[newPrefix] = JSON.stringify(obj[key]); // Arrays are stringified
      } else {
        result[newPrefix] = obj[key];
      }
    }
  }
  return result;
};

const convertJsonToCsv = (jsonData: any): string => {
  let dataArray: any[];

  if (Array.isArray(jsonData)) {
    dataArray = jsonData;
  } else if (typeof jsonData === 'object' && jsonData !== null) {
    dataArray = [jsonData]; // Wrap single object in an array
  } else {
    // Handle cases where jsonData is not an array or object (e.g., primitive, though less useful for CSV)
    // For simplicity, we'll try to create a single-value CSV or throw an error.
    // This scenario should ideally be caught earlier or handled with more specific UI.
    if (jsonData === null || jsonData === undefined || typeof jsonData === 'function' || typeof jsonData === 'symbol') {
       throw new Error("Input JSON data must be an array of objects or a single object.");
    }
     // For a single primitive value, create a CSV with one header 'value' and one row.
    return `value\n${escapeCsvCell(jsonData)}`;
  }
  
  if (dataArray.length === 0) {
    return ''; // Return empty string for empty array
  }

  // Process each item to ensure it's an object and flatten it
  const flattenedData = dataArray.map(item => {
    if (typeof item === 'object' && item !== null) {
      return flattenObject(item);
    }
    // If item is not an object (e.g. array of primitives), represent it as a single-column object
    return { 'value': item }; 
  });

  // Collect all unique headers from all flattened objects
  const headersSet = new Set<string>();
  flattenedData.forEach(obj => {
    Object.keys(obj).forEach(key => headersSet.add(key));
  });
  const headers = Array.from(headersSet).sort(); // Sort for consistent column order

  if (headers.length === 0 && flattenedData.length > 0 && flattenedData.every(item => typeof item.value !== 'undefined' && Object.keys(item).length === 1)) {
      // This case handles an array of primitives like [1,2,3] or ["a","b","c"]
      // which were converted to [{value:1},{value:2},{value:3}]
      const csvRows = [
        "value", // Header row
        ...flattenedData.map(rowObj => escapeCsvCell(rowObj.value))
      ];
      return csvRows.join('\n');
  }


  const csvRows = [
    headers.map(header => escapeCsvCell(header)).join(','), // Header row
    ...flattenedData.map(obj =>
      headers.map(header => escapeCsvCell(obj[header])).join(',')
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
      let errorMessage = "Failed to convert JSON to CSV. Please check the data format.";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      setCsvData(null); // Clear any potentially wrong CSV data on error
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
       toast({ title: "Nothing to Copy", description: "CSV output is empty or contains only an error message.", variant: "destructive"});
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
      URL.revokeObjectURL(url); // Clean up the object URL
      toast({ title: "Download Started", description: "CSV file download initiated." });
    } else {
      toast({ title: "Nothing to Download", description: "CSV output is empty or contains only an error message.", variant: "destructive"});
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
                    placeholder='Paste your JSON data here. e.g., [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 24}] or {"id":1, "data":{"value": "test"}}'
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

      {csvData !== null && ( // Show card even if csvData is an empty string (e.g. for empty JSON array input)
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated CSV Data</CardTitle>
            <CardDescription>Review your CSV data below. You can copy or download it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={csvData} // Display empty string or error string if conversion failed
              readOnly
              className="min-h-[200px] resize-y text-base font-code bg-background/50"
              aria-label="Generated CSV output"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handleCopyCsv} variant="outline" size="sm" disabled={!csvData || csvData.trim() === ""}>
                <Copy className="mr-2 h-4 w-4" /> Copy CSV
              </Button>
              <Button onClick={handleDownloadCsv} variant="outline" size="sm" disabled={!csvData || csvData.trim() === ""}>
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
