
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, XCircle, FileText as FileTextIcon, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

export function ImageToPdfClient() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2, 15) // simple unique id
      }));
    
    if (newImages.length !== acceptedFiles.length) {
        toast({
            title: "Some files skipped",
            description: "Only image files (JPG, PNG, etc.) are accepted.",
            variant: "default"
        });
    }

    setUploadedImages(prev => [...prev, ...newImages]);
    setPdfUrl(null);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    multiple: true,
  });

  const removeImage = (idToRemove: string) => {
    setUploadedImages(prev => prev.filter(img => {
        if (img.id === idToRemove) {
            URL.revokeObjectURL(img.preview);
            return false;
        }
        return true;
    }));
  };
  
  const removeAllImages = () => {
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setPdfUrl(null);
     toast({
      title: "All Images Cleared",
      description: "You can now upload new images.",
    });
  };

  const handleConvertToPdf = async () => {
    if (uploadedImages.length === 0) {
      toast({ title: "No Images", description: "Please upload at least one image.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setPdfUrl(null);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
      });

      for (let i = 0; i < uploadedImages.length; i++) {
        const imgData = uploadedImages[i].preview;
        const imgProps = await new Promise<{width: number, height: number}>((resolve, reject) => {
            const image = new window.Image();
            image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
            image.onerror = reject;
            image.src = imgData;
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const margin = 20; // 20pt margin

        const usableWidth = pdfWidth - 2 * margin;
        const usableHeight = pdfHeight - 2 * margin;

        const imgAspectRatio = imgProps.width / imgProps.height;
        const pageAspectRatio = usableWidth / usableHeight;

        let newWidth, newHeight;

        if (imgAspectRatio > pageAspectRatio) { // Image is wider than page
            newWidth = usableWidth;
            newHeight = newWidth / imgAspectRatio;
        } else { // Image is taller than page or same aspect ratio
            newHeight = usableHeight;
            newWidth = newHeight * imgAspectRatio;
        }
        
        // Center the image
        const x = margin + (usableWidth - newWidth) / 2;
        const y = margin + (usableHeight - newHeight) / 2;

        if (i > 0) {
          doc.addPage();
        }
        doc.addImage(imgData, uploadedImages[i].file.type.split('/')[1].toUpperCase(), x, y, newWidth, newHeight);
      }
      
      const pdfBlob = doc.output('blob');
      const generatedUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(generatedUrl);
      
      toast({
        title: "PDF Generated!",
        description: `PDF with ${uploadedImages.length} image(s) is ready for download.`,
      });

    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({ title: "Error", description: error.message || "Failed to generate PDF.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Images</CardTitle>
          <CardDescription>Drag & drop or click to select JPG, PNG, or WebP images.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
          >
            <input {...getInputProps()} aria-label="Image upload input" />
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            {isDragActive ? <p className="text-primary">Drop images here...</p> : <p>Drag 'n' drop images, or click to select</p>}
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</p>
          </div>
        </CardContent>
      </Card>

      {uploadedImages.length > 0 && (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-xl">Selected Images ({uploadedImages.length})</CardTitle>
                    <CardDescription>Preview of your uploaded images.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={removeAllImages} disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((img) => (
              <div key={img.id} className="relative group aspect-square border rounded-md overflow-hidden">
                <Image src={img.preview} alt={img.file.name} layout="fill" objectFit="cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 z-10 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(img.id)}
                  aria-label={`Remove ${img.file.name}`}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Convert to PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConvertToPdf} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileTextIcon className="mr-2 h-4 w-4" />}
              Convert to PDF
            </Button>
          </CardContent>
        </Card>
      )}

      {pdfUrl && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">PDF Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <a href={pdfUrl} download="images.pdf" aria-label="Download PDF">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
