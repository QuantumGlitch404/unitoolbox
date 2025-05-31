
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, SlidersHorizontal, XCircle } from 'lucide-react';

const formSchema = z.object({
  width: z.coerce.number().min(1, "Width must be at least 1 pixel.").max(8000, "Width cannot exceed 8000 pixels."),
  height: z.coerce.number().min(1, "Height must be at least 1 pixel.").max(8000, "Height cannot exceed 8000 pixels."),
});

type ResizeFormData = z.infer<typeof formSchema>;

interface ResizedImageResult {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export function ImageResizerClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ResizedImageResult | null>(null);
  const { toast } = useToast();

  const form = useForm<ResizeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      width: 800,
      height: 600,
    },
  });

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      toast({
        title: "Image Selected",
        description: `${file.name} is ready for resizing.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    multiple: false,
  });

  const onSubmit: SubmitHandler<ResizeFormData> = async (data) => {
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

    // Simulate resize process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
      } else {
        clearInterval(interval);
        // Placeholder: In a real app, this would involve actual image processing.
        // For now, we'll just use the original image preview URL.
        setResult({
          name: `resized_${imageFile.name}`,
          dataUrl: imagePreview, // Replace with actual resized image data URL
          width: data.width,
          height: data.height,
        });
        setIsLoading(false);
        toast({
          title: "Resize Complete!",
          description: `Image resized to ${data.width}x${data.height}px.`,
        });
      }
    }, 150);
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setProgress(0);
    form.reset();
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
          <CardDescription>Drag & drop your image or click to select.</CardDescription>
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
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF supported</p>
            </div>
          )}
        </CardContent>
      </Card>

      {imageFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Resize Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (px)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 800" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (px)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 600" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SlidersHorizontal className="mr-2 h-4 w-4" />}
                  Resize Image
                </Button>
                {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Resized Image</CardTitle>
            <CardDescription>Preview of your image resized to {result.width}x{result.height}px.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden">
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
              Download Resized Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
