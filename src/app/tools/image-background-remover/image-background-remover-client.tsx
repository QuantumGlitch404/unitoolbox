
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, Scissors as ScissorsIcon, XCircle } from 'lucide-react';

interface ProcessedImageResult {
  name: string;
  dataUrl: string;
}

export function ImageBackgroundRemoverClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file.",
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
        title: "Image Selected",
        description: `${file.name} is ready for background removal.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  });

  const handleRemoveBackground = async () => {
    if (!imageFile || !imagePreview) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    setProgress(30);

    const img = document.createElement('img');
    img.crossOrigin = "anonymous";

    img.onload = () => {
      setProgress(60);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast({
          title: "Canvas Error",
          description: "Could not get canvas context.",
          variant: "destructive",
        });
        setIsLoading(false);
        setProgress(0);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const targetR = data[0];
      const targetG = data[1];
      const targetB = data[2];
      const tolerance = 40; // Increased tolerance for broader color matching

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (
          Math.abs(r - targetR) <= tolerance &&
          Math.abs(g - targetG) <= tolerance &&
          Math.abs(b - targetB) <= tolerance
        ) {
          data[i + 3] = 0; 
        }
      }
      ctx.putImageData(imageData, 0, 0);
      
      const processedDataUrl = canvas.toDataURL('image/png');
      setResult({
        name: `bg_removed_${imageFile.name.split('.')[0]}.png`,
        dataUrl: processedDataUrl,
      });
      setProgress(100);
      toast({
        title: "Background Removal Attempted!",
        description: "Basic background removal applied. Quality depends on image uniformity.",
      });
      setIsLoading(false);
    };

    img.onerror = () => {
      toast({
        title: "Image Load Error",
        description: "Could not load the image for processing.",
        variant: "destructive",
      });
      setIsLoading(false);
      setProgress(0);
    };
    
    img.src = imagePreview;
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setProgress(0);
    toast({
      title: "Image Removed",
      description: "You can now upload a new image.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Image</CardTitle>
          <CardDescription>
            Upload an image to attempt background removal. This non-AI tool works best with <strong>simple, fairly uniform backgrounds</strong>. It identifies the color of the <strong>top-left pixel</strong> and makes colors within a certain tolerance of it transparent. The effectiveness heavily depends on your image's background. For complex backgrounds, consider AI-powered solutions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden">
                <Image src={imagePreview} alt="Selected image preview" layout="fill" objectFit="contain" />
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 z-10 rounded-full h-7 w-7"
                    onClick={handleRemoveImage}
                    aria-label="Remove image"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">{imageFile?.name}</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
            >
              <input {...getInputProps()} aria-label="Image upload input" />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? <p className="text-primary">Drop the image here...</p> : <p>Drag 'n' drop, or click to select</p>}
               <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</p>
            </div>
          )}
        </CardContent>
      </Card>

      {imageFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Process Image</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRemoveBackground} disabled={isLoading || !imageFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScissorsIcon className="mr-2 h-4 w-4" />}
              Remove Background
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Processed Image</CardTitle>
            <CardDescription>Image with background processed. Transparent areas are shown with a checkerboard pattern.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden checkerboard-bg">
              <Image src={result.dataUrl} alt={result.name} layout="fill" objectFit="contain" />
            </div>
            <Button 
              onClick={() => {
                  const link = document.createElement('a');
                  link.href = result.dataUrl;
                  link.download = result.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast({ title: "Download Started", description: `Downloading ${result.name}`});
              }} 
              className="w-full sm:w-auto"
              aria-label={`Download ${result.name}`}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
