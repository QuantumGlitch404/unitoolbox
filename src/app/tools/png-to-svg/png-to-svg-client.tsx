
"use client";

import { useState, useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, XCircle, Palette } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface ImageConverterClientProps {
  sourceFormat: string;
  targetFormat: string;
  accept: Accept;
  outputFileNameSuffix: string;
  isConceptual?: boolean;
}

export function PNGToSVGClient({
  sourceFormat = "PNG",
  targetFormat = "SVG",
  accept = { 'image/png': ['.png'] },
  outputFileNameSuffix = "_converted.svg",
  isConceptual = true,
}: ImageConverterClientProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ name: string; dataUrl: string } | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const isValidType = Object.keys(accept).some(type => file.type === type);
       if (!isValidType && !Object.values(accept).flat().some(ext => file.name.toLowerCase().endsWith(ext as string))) {
         toast({
          title: "Invalid File Type",
          description: `Please upload a ${sourceFormat} image file. (${Object.values(accept).flat().join(', ')})`,
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      toast({
        title: `${sourceFormat} Image Selected`,
        description: `${file.name} is ready for conceptual conversion to ${targetFormat}.`,
      });
    }
  }, [toast, sourceFormat, targetFormat, accept]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  const handleConvert = async () => {
    if (!imageFile || !imagePreview) {
      toast({ title: "No Image", description: `Please upload a ${sourceFormat} image first.`, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress < 80) setProgress(currentProgress);
      else clearInterval(progressInterval);
    }, 100);
    
    try {
      const img = new window.Image();
      img.onload = () => {
        const outputFileName = `${imageFile.name.split('.').slice(0, -1).join('.')}${outputFileNameSuffix}`;
        
        // Create a placeholder SVG that embeds the original PNG
        const placeholderSvgData = `
<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}" viewBox="0 0 ${img.naturalWidth} ${img.naturalHeight}">
  <title>Conceptual PNG to SVG: ${imageFile.name}</title>
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <image href="${imagePreview}" x="0" y="0" width="${img.naturalWidth}" height="${img.naturalHeight}" />
  <text x="10" y="20" font-family="sans-serif" font-size="12" fill="#333" style="paint-order: stroke; stroke: #fff; stroke-width: 2px; stroke-linejoin: round;">
    Conceptual PNG to SVG Conversion
  </text>
  <text x="10" y="40" font-family="sans-serif" font-size="10" fill="#555" style="paint-order: stroke; stroke: #fff; stroke-width: 2px; stroke-linejoin: round;">
    Original PNG embedded. Not a true vectorization.
  </text>
</svg>`;
        const placeholderSvgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(placeholderSvgData)))}`;

        setResult({ name: outputFileName, dataUrl: placeholderSvgDataUrl });
        setProgress(100);
        toast({
          title: "Conceptual Conversion Complete!",
          description: `Generated a placeholder SVG embedding the ${sourceFormat}. True vectorization is complex.`,
        });
      };
      img.onerror = () => {
        throw new Error("Failed to load the image for placeholder generation.");
      };
      img.src = imagePreview;

    } catch (error: any) {
      console.error(`Error during conceptual conversion to ${targetFormat}:`, error);
      toast({ title: "Conversion Error", description: error.message || `An unexpected error occurred.`, variant: "destructive" });
      setProgress(0);
    } finally {
        clearInterval(progressInterval);
        setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setProgress(0);
    toast({
      title: "Image Removed",
      description: `You can now upload a new ${sourceFormat} image.`,
    });
  };

  return (
    <div className="space-y-6">
      {isConceptual && (
         <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Conceptual Tool</AlertTitle>
          <AlertDescription>
            Converting raster images (like PNG) to true vector graphics (SVG) is a complex process called vectorization, often requiring AI or sophisticated algorithms. This tool creates an SVG file that embeds your PNG image. It does not perform true vectorization.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload {sourceFormat} Image</CardTitle>
          <CardDescription>Select a {sourceFormat} file to conceptually convert to {targetFormat}.</CardDescription>
        </CardHeader>
        <CardContent>
          {imagePreview && imageFile ? (
            <div className="space-y-4">
              <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden">
                <Image src={imagePreview} alt={`${sourceFormat} image preview`} layout="fill" objectFit="contain" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10 rounded-full h-7 w-7"
                  onClick={handleRemoveImage}
                  aria-label={`Remove ${sourceFormat} image`}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">{imageFile.name}</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
            >
              <input {...getInputProps()} aria-label={`${sourceFormat} image upload input`} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? <p className="text-primary">Drop the {sourceFormat.toLowerCase()} file here...</p> : <p>Drag 'n' drop, or click to select</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Supported: {Object.values(accept).flat().join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {imageFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Convert to {targetFormat}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConvert} disabled={isLoading || !imageFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
              Convert to {targetFormat}
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated {targetFormat} (Conceptual)</CardTitle>
             <CardDescription>This SVG embeds the original PNG. It is not a vectorized image.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden checkerboard-bg p-2">
              {/* Use an img tag to preview SVG, browsers render it */}
              <Image src={result.dataUrl} alt={result.name} layout="fill" objectFit="contain" />
            </div>
            <Button
              asChild
              className="w-full sm:w-auto"
              aria-label={`Download ${result.name}`}
            >
              <a href={result.dataUrl} download={result.name}>
                <Download className="mr-2 h-4 w-4" /> Download {targetFormat}
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
