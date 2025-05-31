
"use client";

import { useState, useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, XCircle, FileType2 } from 'lucide-react';

interface ImageConverterClientProps {
  sourceFormat: string;
  targetFormat: string;
  accept: Accept;
  outputFileNameSuffix: string;
}

export function JPGToPNGClient({
  sourceFormat = "JPG",
  targetFormat = "PNG",
  accept = { 'image/jpeg': ['.jpg', '.jpeg'] },
  outputFileNameSuffix = "_to_png.png",
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
        description: `${file.name} is ready for conversion to ${targetFormat}.`,
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
      toast({
        title: "No Image",
        description: `Please upload a ${sourceFormat} image first.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
      } else {
        clearInterval(progressInterval);
        const outputFileName = `${imageFile.name.split('.').slice(0, -1).join('.')}${outputFileNameSuffix}`;
        setResult({
          name: outputFileName,
          dataUrl: imagePreview, 
        });
        setIsLoading(false);
        toast({
          title: "Conversion Complete!",
          description: `Image successfully converted to ${targetFormat} (simulated).`,
        });
      }
    }, 150);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if(imagePreview) URL.revokeObjectURL(imagePreview);
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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload {sourceFormat} Image</CardTitle>
          <CardDescription>Select a {sourceFormat} file to convert to {targetFormat}.</CardDescription>
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileType2 className="mr-2 h-4 w-4" />}
              Convert to {targetFormat}
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Converted {targetFormat} Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden checkerboard-bg">
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
