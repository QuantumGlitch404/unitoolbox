
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, XCircle, FileImage } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface PageImage {
  id: string;
  dataUrl: string;
  pageNumber: number;
}

export function PdfToImageClient() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [convertedImages, setConvertedImages] = useState<PageImage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // IMPORTANT: You MUST manually copy 'pdf.worker.min.js'
    // from 'node_modules/pdfjs-dist/build/pdf.worker.min.js'
    // to your project's 'public' folder (at the root level) for this to work.
    // For example, the file should be accessible at `your-app-url/pdf.worker.min.js`.
    const workerSrcPath = `/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrcPath;
    console.log(`PDF.js version: ${pdfjsLib.version}, Worker path set to: ${workerSrcPath}`);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type !== 'application/pdf') {
        toast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "destructive" });
        return;
      }
      setPdfFile(file);
      setConvertedImages([]);
      setProgress(0);
      setTotalPages(0);
      toast({ title: "PDF Selected", description: `${file.name} is ready for conversion.` });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleConvertPdfToImages = async () => {
    if (!pdfFile) {
      toast({ title: "No PDF", description: "Please upload a PDF file first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setConvertedImages([]);

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        toast({ title: "File Error", description: "Could not read PDF file.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      try {
        const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
        const loadingTask = pdfjsLib.getDocument(typedArray);
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);
        const images: PageImage[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 }); // Scale can be adjusted
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if(!context){
            throw new Error("Could not get canvas context for page " + i);
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
          
          images.push({
            id: `page-${i}`,
            dataUrl: canvas.toDataURL('image/png'),
            pageNumber: i,
          });
          setProgress(Math.round((i / pdf.numPages) * 100));
        }
        setConvertedImages(images);
        toast({ title: "Conversion Complete!", description: `${pdf.numPages} page(s) converted to images.` });
      } catch (error: any) {
        console.error("Error converting PDF to images:", error);
        toast({ title: "Conversion Error", description: error.message || "Failed to process PDF. Ensure the worker file is in the /public directory and accessible.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fileReader.onerror = () => {
         toast({ title: "File Read Error", description: "Error occurred while reading the PDF file.", variant: "destructive" });
         setIsLoading(false);
    }
    fileReader.readAsArrayBuffer(pdfFile);
  };
  
  const handleRemovePdf = () => {
    setPdfFile(null);
    setConvertedImages([]);
    setProgress(0);
    setTotalPages(0);
    toast({ title: "PDF Removed", description: "You can now upload a new PDF." });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload PDF</CardTitle>
          <CardDescription>Select a PDF file to convert its pages to images.</CardDescription>
        </CardHeader>
        <CardContent>
          {pdfFile ? (
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">Selected: {pdfFile.name}</p>
              <Button variant="outline" size="sm" onClick={handleRemovePdf}>
                <XCircle className="mr-2 h-4 w-4" /> Remove PDF
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
            >
              <input {...getInputProps()} aria-label="PDF upload input" />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? <p className="text-primary">Drop the PDF here...</p> : <p>Drag 'n' drop, or click to select</p>}
               <p className="text-xs text-muted-foreground mt-1">.pdf files only</p>
            </div>
          )}
        </CardContent>
      </Card>

      {pdfFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Convert to Images</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConvertPdfToImages} disabled={isLoading || !pdfFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileImage className="mr-2 h-4 w-4" />}
              Convert PDF to Images
            </Button>
            {isLoading && (
                <div className="mt-2">
                    <Progress value={progress} className="w-full h-2" />
                    <p className="text-sm text-muted-foreground mt-1 text-center">
                        Processing page {Math.ceil(progress * totalPages / 100)} of {totalPages}...
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      )}

      {convertedImages.length > 0 && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Converted Images ({convertedImages.length})</CardTitle>
            <CardDescription>Each PDF page converted to a PNG image. Click to download.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {convertedImages.map((img) => (
              <div key={img.id} className="border rounded-md p-3 space-y-2 bg-background shadow">
                <div className="aspect-[210/297] w-full overflow-hidden rounded border checkerboard-bg"> {/* A4 Aspect Ratio for preview */}
                    <Image src={img.dataUrl} alt={`Page ${img.pageNumber}`} width={210} height={297} layout="responsive" objectFit="contain" />
                </div>
                <Button asChild size="sm" className="w-full">
                  <a href={img.dataUrl} download={`${pdfFile?.name.replace('.pdf', '') || 'page'}_${img.pageNumber}.png`}>
                    <Download className="mr-2 h-4 w-4" /> Download Page {img.pageNumber}
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
