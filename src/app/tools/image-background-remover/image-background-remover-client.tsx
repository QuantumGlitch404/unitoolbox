
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, Wand2, XCircle } from 'lucide-react';
import { removeBackground, type RemoveBackgroundInput } from '@/ai/flows/image-background-remover-flow';

interface ProcessedImageResult {
  name: string;
  dataUrl: string;
}

export function ImageBackgroundRemoverClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Keep for visual feedback, even if flow duration varies
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
    setProgress(50); // Indicate processing has started
    setResult(null);

    try {
      const input: RemoveBackgroundInput = { photoDataUri: imagePreview };
      const aiResult = await removeBackground(input);
      
      setResult({
        name: `bg_removed_${imageFile.name.split('.')[0]}.png`, // Assume png output from AI for simplicity
        dataUrl: aiResult.processedPhotoDataUri,
      });
      setProgress(100);
      toast({
        title: "Background Processed!",
        description: "The AI has attempted to remove the background.",
      });
    } catch (error: any) {
      console.error("Error removing background:", error);
      setProgress(0);
      toast({
        title: "Background Removal Failed",
        description: error.message || "Could not process the image. The AI might not have been able to process this specific image.",
        variant: "destructive",
      });
    } finally {
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
      description: "You can now upload a new image.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Image</CardTitle>
          <CardDescription>Select image to remove background from.</CardDescription>
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Remove Background (AI)
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Processed Image</CardTitle>
            <CardDescription>Image with background processed by AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden">
              {/* Displaying the AI processed image */}
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
