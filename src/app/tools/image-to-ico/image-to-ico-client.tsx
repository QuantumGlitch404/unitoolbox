
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, BoxSelect as BoxSelectIcon, XCircle } from 'lucide-react';

const iconSizes = [
  { label: "16x16", value: 16 },
  { label: "24x24", value: 24 },
  { label: "32x32", value: 32 },
  { label: "48x48", value: 48 },
  { label: "64x64", value: 64 },
  { label: "128x128", value: 128 },
  { label: "256x256", value: 256 },
];

interface ConvertedIconResult {
  name: string;
  dataUrl: string;
  size: number;
}

export function ImageToIcoClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConvertedIconResult | null>(null);
  const [selectedSize, setSelectedSize] = useState<number>(32);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File Type", description: "Please upload an image file (JPG, PNG, WebP).", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      toast({ title: "Image Selected", description: `${file.name} is ready for icon conversion.` });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    multiple: false,
  });

  const handleConvertToIcon = async () => {
    if (!imageFile || !imagePreview) {
      toast({ title: "No Image", description: "Please upload an image first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = selectedSize;
        canvas.height = selectedSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error("Could not get canvas context for image resizing.");
        }
        // Draw image centered and scaled to fill (aspect ratio maintained, then cropped if needed)
        const scale = Math.max(selectedSize / img.naturalWidth, selectedSize / img.naturalHeight);
        const x = (selectedSize - img.naturalWidth * scale) / 2;
        const y = (selectedSize - img.naturalHeight * scale) / 2;
        ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
        
        const dataUrl = canvas.toDataURL('image/png'); // Output as PNG
        const originalNameNoExt = imageFile.name.split('.').slice(0, -1).join('.') || 'icon';

        setResult({
          name: `${originalNameNoExt}_${selectedSize}x${selectedSize}.ico`, // Suggest .ico extension
          dataUrl: dataUrl,
          size: selectedSize,
        });
        toast({ title: "Icon Generated!", description: `Image converted to ${selectedSize}x${selectedSize}px PNG, ready for download as .ico.` });
      };
      img.onerror = () => {
        throw new Error("Failed to load the image for conversion.");
      };
      img.src = imagePreview;

    } catch (error: any) {
      console.error("Error converting to icon:", error);
      toast({ title: "Conversion Error", description: error.message || "Failed to generate icon.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    if(imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setResult(null);
    toast({ title: "Image Removed", description: "You can now upload a new image." });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Image</CardTitle>
          <CardDescription>Select an image to convert to an icon.</CardDescription>
        </CardHeader>
        <CardContent>
          {imagePreview && imageFile ? (
            <div className="space-y-4 text-center">
              <div className="relative inline-block aspect-square w-32 h-32 mx-auto border rounded-md overflow-hidden">
                <Image src={imagePreview} alt="Selected image preview" layout="fill" objectFit="contain" />
              </div>
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1 right-1 text-muted-foreground hover:text-destructive"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              <p className="text-sm text-muted-foreground">{imageFile.name}</p>
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
            <CardTitle className="font-headline text-xl">Icon Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="iconSize">Icon Size (pixels)</Label>
              <Select
                value={selectedSize.toString()}
                onValueChange={(value) => setSelectedSize(parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="iconSize" aria-label="Icon size select">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {iconSizes.map(size => (
                    <SelectItem key={size.value} value={size.value.toString()}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleConvertToIcon} disabled={isLoading || !imageFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BoxSelectIcon className="mr-2 h-4 w-4" />}
              Convert to Icon
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Icon ({result.size}x{result.size})</CardTitle>
            <CardDescription>Preview of your generated icon (PNG format, downloadable as .ico).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
             <div className="relative inline-block border rounded-md overflow-hidden checkerboard-bg" style={{ width: result.size, height: result.size }}>
                <Image src={result.dataUrl} alt={result.name} width={result.size} height={result.size} />
              </div>
            <Button asChild className="w-full sm:w-auto">
              <a href={result.dataUrl} download={result.name} aria-label={`Download ${result.name}`}>
                <Download className="mr-2 h-4 w-4" /> Download .ico
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
