
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
import { Loader2, Database as DatabaseIcon, Download, Copy } from 'lucide-react';

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let inQuotes = false;
  let currentCell = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') { // Escaped quote ""
        currentCell += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(currentCell.trim());
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  cells.push(currentCell.trim()); // Add the last cell
  return cells;
};

const convertCsvToJson = (csvText: string): any[] => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const jsonData: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue; // Skip empty lines
    const values = parseCsvLine(lines[i]);
    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] !== undefined ? values[index] : "";
    });
    jsonData.push(entry);
  }
  return jsonData;
};

const formSchema = z.object({
  csvData: z.string().min(1, "CSV data cannot be empty."),
});

type CsvToJsonFormData = z.infer<typeof formSchema>;

export function CsvToJsonClient() {
  const [jsonData, setJsonData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CsvToJsonFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      csvData: "",
    },
  });

  const onSubmit: SubmitHandler<CsvToJsonFormData> = async (data) => {
    setIsLoading(true);
    setJsonData(null);
    
    try {
      const result = convertCsvToJson(data.csvData);
      const formattedJson = JSON.stringify(result, null, 2); // Pretty print JSON
      setJsonData(formattedJson);
      
      toast({
        title: "Conversion Successful!",
        description: "CSV data has been converted to JSON.",
      });
    } catch (error: any) {
      console.error("Error converting CSV to JSON:", error);
      setJsonData(null);
      toast({
        title: "Conversion Error",
        description: error.message || "Failed to convert CSV. Check format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (jsonData) {
      navigator.clipboard.writeText(jsonData)
        .then(() => toast({ title: "Copied!", description: "JSON data copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy JSON data.", variant: "destructive" }));
    }
  };

  const handleDownloadJson = () => {
    if (jsonData) {
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "converted_data.json");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Download Started", description: "JSON file download initiated." });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="csvData"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">CSV Data</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Paste CSV data here. e.g.,\nname,age,city\nAlice,30,New York\nBob,24,Chicago'
                    className="min-h-[200px] resize-y text-base font-code"
                    {...field}
                    aria-label="CSV input area"
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
              <DatabaseIcon className="mr-2 h-4 w-4" />
            )}
            Convert to JSON
          </Button>
        </form>
      </Form>

      {jsonData !== null && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated JSON Data</CardTitle>
            <CardDescription>Review your JSON data. It will be an array of objects.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jsonData}
              readOnly
              className="min-h-[200px] resize-y text-base font-code bg-background/50"
              aria-label="Generated JSON output"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handleCopyJson} variant="outline" size="sm" disabled={!jsonData}>
                <Copy className="mr-2 h-4 w-4" /> Copy JSON
              </Button>
              <Button onClick={handleDownloadJson} variant="outline" size="sm" disabled={!jsonData}>
                <Download className="mr-2 h-4 w-4" /> Download JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
