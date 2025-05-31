
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, Film as FilmIcon, XCircle, Scissors } from 'lucide-react';

interface ConversionResult {
  name: string;
  dataUrl: string; // This would be the GIF data URL
}

export function VideoToGifClient() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a video file (e.g., MP4, WebM, MOV).",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file)); // For video tag preview
      setResult(null);
      toast({
        title: "Video Selected",
        description: `${file.name} is ready for conversion.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv'] },
    multiple: false,
  });

  const handleConvertToGif = async () => {
    if (!videoFile) {
      toast({
        title: "No Video",
        description: "Please upload a video file first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    // Simulate conversion process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
      } else {
        clearInterval(interval);
        // Simulate result (using a placeholder GIF image)
        setResult({
          name: `converted_${videoFile.name.split('.')[0]}.gif`,
          dataUrl: "https://placehold.co/300x200.gif?text=Processing...", // Placeholder
        });
        setIsLoading(false);
        toast({
          title: "Conversion Complete!",
          description: "Your video has been converted to GIF (simulated).",
        });
      }
    }, 300);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setResult(null);
    setProgress(0);
    toast({
      title: "Video Removed",
      description: "You can now upload a new video.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Video</CardTitle>
          <CardDescription>Select a video file to convert to an animated GIF.</CardDescription>
        </CardHeader>
        <CardContent>
          {videoPreview && videoFile ? (
            <div className="space-y-4">
              <div className="relative w-full max-w-md mx-auto border rounded-md overflow-hidden">
                <video src={videoPreview} controls className="w-full aspect-video" />
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 z-10 rounded-full h-7 w-7"
                    onClick={handleRemoveVideo}
                    aria-label="Remove video"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">{videoFile.name}</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
            >
              <input {...getInputProps()} aria-label="Video upload input" />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? <p className="text-primary">Drop the video here...</p> : <p>Drag 'n' drop, or click to select</p>}
              <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV, AVI, MKV supported</p>
            </div>
          )}
        </CardContent>
      </Card>

      {videoFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Conversion Settings (Placeholder)</CardTitle>
            <CardDescription>Adjust options for your GIF. (Actual conversion not implemented yet).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time (seconds)</Label>
                <Input id="startTime" type="number" defaultValue="0" placeholder="e.g., 0" />
              </div>
              <div>
                <Label htmlFor="endTime">End Time (seconds)</Label>
                <Input id="endTime" type="number" placeholder="e.g., 5" />
              </div>
            </div>
             <div>
                <Label htmlFor="frameRate">Frame Rate (fps)</Label>
                <Input id="frameRate" type="number" defaultValue="10" placeholder="e.g., 10" />
              </div>
            <Button onClick={handleConvertToGif} disabled={isLoading || !videoFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilmIcon className="mr-2 h-4 w-4" />}
              Convert to GIF
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated GIF (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="relative aspect-video w-full max-w-xs mx-auto border rounded-md overflow-hidden bg-muted">
                <Image src={result.dataUrl} alt={result.name} layout="fill" objectFit="contain" data-ai-hint="animated gif" />
              </div>
            <Button 
              onClick={() => {
                  // This is a placeholder download
                  const link = document.createElement('a');
                  link.href = result.dataUrl; // This will link to the placeholder.co image
                  link.download = result.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast({ title: "Download Started (Placeholder)", description: `Downloading ${result.name}`});
              }} 
              className="w-full sm:w-auto"
              aria-label={`Download ${result.name}`}
            >
              <Download className="mr-2 h-4 w-4" />
              Download GIF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
