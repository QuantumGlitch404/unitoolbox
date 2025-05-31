
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText as FileTextIcon, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const formSchema = z.object({
  text: z.string().min(1, "Text content cannot be empty."),
  fontSize: z.coerce.number().min(8).max(72).default(12),
  font: z.string().default("Arial"),
  filename: z.string().min(1, "Filename cannot be empty").default("document.pdf")
    .refine(name => name.toLowerCase().endsWith('.pdf'), { message: "Filename must end with .pdf" }),
});

type TextToPdfFormData = z.infer<typeof formSchema>;

export function TextToPdfClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TextToPdfFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      fontSize: 12,
      font: "Arial",
      filename: "document.pdf",
    },
  });

  const onSubmit: SubmitHandler<TextToPdfFormData> = async (data) => {
    setIsLoading(true);
    setPdfUrl(null);
    
    // Short delay to show loading state, actual PDF generation is quick
    await new Promise(resolve => setTimeout(resolve, 100)); 
    
    try {
      const doc = new jsPDF({
        orientation: 'p', // portrait
        unit: 'pt', // points for font size and margins
        format: 'a4', // page format
      });

      let pdfFontName = 'helvetica'; // Default jsPDF font
      if (data.font === 'Times New Roman' || data.font === 'Georgia') {
        pdfFontName = 'times';
      } else if (data.font === 'Courier New') {
        pdfFontName = 'courier';
      }
      // 'Arial' and 'Verdana' will use the default 'helvetica'

      doc.setFont(pdfFontName);
      doc.setFontSize(data.fontSize);

      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 40; // 40pt margin on all sides
      const usableWidth = pageWidth - 2 * margin;
      let currentY = margin;
      const lineHeight = data.fontSize * 1.2; // 1.2 line spacing factor

      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(data.text, usableWidth);

      lines.forEach((line: string) => {
        if (currentY + lineHeight > pageHeight - margin) { // Check if new line exceeds page height
          doc.addPage();
          currentY = margin; // Reset Y to top margin on new page
        }
        doc.text(line, margin, currentY);
        currentY += lineHeight; // Move to next line position
      });
      
      const pdfBlob = doc.output('blob');
      const generatedUrl = URL.createObjectURL(pdfBlob);
      
      setPdfUrl(generatedUrl); // This URL will be used for the download link
      
      toast({
        title: "PDF Generated!",
        description: `${data.filename} is ready for download.`,
      });

    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Text Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your text here..."
                    className="min-h-[200px] resize-y text-base"
                    {...field}
                    aria-label="Text input for PDF conversion"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="font"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Family</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger aria-label="Font family select">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'].map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Size (pt)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="12" {...field} aria-label="Font size input"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Filename</FormLabel>
                  <FormControl>
                    <Input placeholder="document.pdf" {...field} aria-label="Output filename"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileTextIcon className="mr-2 h-4 w-4" />
            )}
            Convert to PDF
          </Button>
        </form>
      </Form>

      {pdfUrl && form.getValues("filename") && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">PDF Ready</CardTitle>
            <CardDescription>Your PDF has been generated successfully.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <a href={pdfUrl} download={form.getValues("filename")} aria-label={`Download ${form.getValues("filename")}`}>
                <Download className="mr-2 h-4 w-4" />
                Download {form.getValues("filename")}
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
