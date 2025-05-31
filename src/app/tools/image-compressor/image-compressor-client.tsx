"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, Scissors as ScissorsIcon, XCircle } from 'lucide-react';

interface CompressedImageResult {
  name: string;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  dataUrl: string; // For preview or download simulation
}

export function ImageCompressorClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState(75);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressedImageResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., JPG, PNG, WebP).",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null); // Clear previous result
      toast({
        title: "Image Selected",
        description: `${file.name} is ready for compression.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    multiple: false,
  });

  const handleCompress = async () => {
    if (!imageFile) {
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

    // Simulate compression process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
      } else {
        clearInterval(interval);
        // Simulate result
        const originalSize = imageFile.size;
        const compressedSize = Math.floor(originalSize * (1 - compressionLevel / 150)); // Rough simulation
        const reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;
        
        setResult({
          name: `compressed_${imageFile.name}`,
          originalSize,
          compressedSize,
          reductionPercent: parseFloat(reductionPercent.toFixed(2)),
          dataUrl: imagePreview || "", // Use preview for download sim
        });
        setIsLoading(false);
        toast({
          title: "Compression Complete!",
          description: "Your image has been compressed.",
        });
      }
    }, 200);
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

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Image</CardTitle>
          <CardDescription>Drag & drop an image file here, or click to select.</CardDescription>
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
              <p className="text-sm text-center text-muted-foreground">{imageFile?.name} ({formatBytes(imageFile?.size || 0)})</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
            >
              <input {...getInputProps()} aria-label="Image upload input" />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? (
                <p className="text-primary">Drop the image here...</p>
              ) : (
                <p>Drag 'n' drop an image here, or click to select</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP supported</p>
            </div>
          )}
        </CardContent>
      </Card>

      {imageFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Compression Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="compressionLevel" className="mb-2 block">Compression Level: {compressionLevel}%</Label>
              <Slider
                id="compressionLevel"
                defaultValue={[compressionLevel]}
                max={100}
                step={1}
                onValueChange={(value) => setCompressionLevel(value[0])}
                disabled={isLoading}
                aria-label="Compression level slider"
              />
            </div>
            <Button onClick={handleCompress} disabled={isLoading || !imageFile} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ScissorsIcon className="mr-2 h-4 w-4" />
              )}
              Compress Image
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Compression Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>File Name:</strong> {result.name}</p>
            <p><strong>Original Size:</strong> {formatBytes(result.originalSize)}</p>
            <p><strong>Compressed Size:</strong> {formatBytes(result.compressedSize)}</p>
            <p><strong>Reduction:</strong> <span className="text-green-500">{result.reductionPercent}%</span></p>
            <Button 
              onClick={() => { /* Simulate download */
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
              Download Compressed Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
