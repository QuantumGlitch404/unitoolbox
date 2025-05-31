
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2, Wand2, Copy, XCircle } from 'lucide-react';
import { extractTextFromImage, type ImageToTextInput } from '@/ai/flows/image-to-text-flow';

export function ImageToTextClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string | null>(null);
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
      setExtractedText(null);
      toast({
        title: "Image Selected",
        description: `${file.name} is ready for text extraction.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  });

  const handleExtractText = async () => {
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
    setExtractedText(null);

    // Simulate progress for user feedback
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress < 90) { // Stop before 100 to let AI finish
        setProgress(currentProgress);
      } else {
        clearInterval(progressInterval);
      }
    }, 150);

    try {
      const input: ImageToTextInput = { photoDataUri: imagePreview };
      const result = await extractTextFromImage(input);
      setExtractedText(result.extractedText);
      setProgress(100);
      toast({
        title: "Text Extracted!",
        description: "Text has been successfully extracted from the image by AI.",
      });
    } catch (error: any) {
      console.error("Error extracting text with AI:", error);
      setExtractedText("Failed to extract text. Please try again or use a clearer image.");
      setProgress(0);
      toast({
        title: "AI OCR Error",
        description: error.message || "Could not extract text from the image.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText)
        .then(() => toast({ title: "Copied!", description: "Extracted text copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtractedText(null);
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
          <CardDescription>Select an image file (JPG, PNG, WebP) to extract text from using AI OCR.</CardDescription>
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
            <CardTitle className="font-headline text-xl">Extract Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExtractText} disabled={isLoading || !imageFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Extract Text with AI
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {extractedText && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Extracted Text (AI OCR)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={extractedText}
              readOnly
              className="min-h-[200px] resize-y text-base font-mono bg-background/50"
              aria-label="Extracted text output"
            />
            <Button onClick={handleCopyText} variant="outline" size="sm" className="mt-4">
              <Copy className="mr-2 h-4 w-4" /> Copy Text
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
