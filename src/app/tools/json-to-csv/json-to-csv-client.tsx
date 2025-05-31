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

// Basic JSON to CSV conversion logic (client-side for demo)
// This is a simplified converter and might not handle all edge cases.
const convertJsonToCsv = (jsonData: any[]): string => {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error("Input must be a non-empty array of objects.");
  }

  const headers = Object.keys(jsonData[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...jsonData.map(row => 
      headers.map(header => {
        let cellValue = row[header];
        if (cellValue === null || cellValue === undefined) {
          cellValue = '';
        } else if (typeof cellValue === 'object') {
          cellValue = JSON.stringify(cellValue); // Flatten objects/arrays
        }
        // Escape commas and quotes
        cellValue = String(cellValue).replace(/"/g, '""');
        if (String(cellValue).includes(',')) {
          cellValue = `"${cellValue}"`;
        }
        return cellValue;
      }).join(',')
    )
  ];
  return csvRows.join('\n');
};


const formSchema = z.object({
  jsonData: z.string().min(1, "JSON data cannot be empty.")
    .refine(data => {
      try {
        const parsed = JSON.parse(data);
        return typeof parsed === 'object' && parsed !== null;
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
      if (!Array.isArray(parsedJson)) {
         // If it's a single object, wrap it in an array
        const wrappedJson = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
        const generatedCsv = convertJsonToCsv(wrappedJson);
        setCsvData(generatedCsv);
      } else {
        const generatedCsv = convertJsonToCsv(parsedJson);
        setCsvData(generatedCsv);
      }
      toast({
        title: "Conversion Successful!",
        description: "JSON data has been converted to CSV.",
      });
    } catch (error: any) {
      console.error("Error converting JSON to CSV:", error);
      let errorMessage = "Failed to convert JSON to CSV. Please check the data format.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setCsvData(`Error: ${errorMessage}`);
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
    if (csvData) {
      navigator.clipboard.writeText(csvData)
        .then(() => toast({ title: "Copied!", description: "CSV data copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy CSV data.", variant: "destructive" }));
    }
  };

  const handleDownloadCsv = () => {
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "converted_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Download Started", description: "CSV file download initiated." });
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
                    placeholder='Paste your JSON data here. e.g., [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 24}]'
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

      {csvData && (
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
              <Button onClick={handleCopyCsv} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" /> Copy CSV
              </Button>
              <Button onClick={handleDownloadCsv} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
