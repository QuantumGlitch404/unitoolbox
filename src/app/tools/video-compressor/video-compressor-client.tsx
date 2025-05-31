
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, FileVideo as VideoIcon, XCircle, Settings2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface SimulatedCompressionResult {
  name: string;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  dataUrl: string; // Original video URL for download
}

export function VideoCompressorClient() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [compressionQuality, setCompressionQuality] = useState(70); // Simulated quality
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SimulatedCompressionResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      if (!validVideoTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a common video file (MP4, WebM, MOV, AVI, MKV).",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setResult(null);
      toast({
        title: "Video Selected",
        description: `${file.name} is ready for simulated compression.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'video/mp4': ['.mp4'],
        'video/webm': ['.webm'],
        'video/ogg': ['.ogg'],
        'video/quicktime': ['.mov'],
        'video/x-msvideo': ['.avi'],
        'video/x-matroska': ['.mkv'],
    },
    multiple: false,
  });

  const handleCompressVideo = async () => {
    if (!videoFile || !videoPreview) {
      toast({
        title: "No Video File",
        description: "Please upload a video file first.",
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
        const originalSize = videoFile.size;
        // Simulate compression: higher "quality" means less reduction
        const reductionFactor = (100 - compressionQuality + 10) / 100; // e.g. 70 quality -> 0.4 reduction
        const compressedSize = Math.max(Math.floor(originalSize * reductionFactor), Math.floor(originalSize * 0.1)); // Ensure some reduction, at least 10%
        const reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;

        setResult({
          name: `compressed_sim_${videoFile.name}`,
          originalSize,
          compressedSize,
          reductionPercent: parseFloat(reductionPercent.toFixed(2)),
          dataUrl: videoPreview, // For download, use the original video URL
        });
        setIsLoading(false);
        toast({
          title: "Simulated Compression Complete!",
          description: "Video 'compression' process finished.",
        });
      }
    }, 250); // Slower interval for video
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setResult(null);
    setProgress(0);
    toast({
      title: "Video Removed",
      description: "You can now upload a new video.",
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
       <Alert variant="default" className="border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-300 [&>svg]:text-amber-500 dark:[&>svg]:text-amber-400">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Simulation Note</AlertTitle>
        <AlertDescription>
          Effective client-side video compression is complex. This tool demonstrates the UI and flow for video compression, but the actual compression is **simulated**. The downloaded file will be the original.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Video File</CardTitle>
          <CardDescription>Select a video to 'compress'. Supported: MP4, WebM, MOV, AVI, MKV.</CardDescription>
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
                  aria-label="Remove video file"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">{videoFile.name} ({formatBytes(videoFile.size)})</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
            >
              <input {...getInputProps()} aria-label="Video upload input" />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? <p className="text-primary">Drop the video file here...</p> : <p>Drag 'n' drop, or click to select</p>}
              <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV, AVI, MKV accepted</p>
            </div>
          )}
        </CardContent>
      </Card>

      {videoFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Simulated Compression Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="compressionQuality" className="mb-2 block">Simulated Quality: {compressionQuality}% (Higher = Larger Size)</Label>
              <Slider
                id="compressionQuality"
                defaultValue={[compressionQuality]}
                max={100}
                min={10} // Minimum "quality"
                step={1}
                onValueChange={(value) => setCompressionQuality(value[0])}
                disabled={isLoading}
                aria-label="Simulated compression quality slider"
              />
            </div>
            <Button onClick={handleCompressVideo} disabled={isLoading || !videoFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2 className="mr-2 h-4 w-4" />}
              Compress Video (Simulated)
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Simulated Compression Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>File Name:</strong> {result.name}</p>
            <p><strong>Original Size:</strong> {formatBytes(result.originalSize)}</p>
            <p><strong>Simulated Compressed Size:</strong> {formatBytes(result.compressedSize)}</p>
            <p><strong>Simulated Reduction:</strong> <span className="text-green-500">{result.reductionPercent}%</span></p>
            <Button
              asChild
              className="w-full sm:w-auto"
              aria-label={`Download ${result.name} (original file)`}
            >
              <a href={result.dataUrl} download={videoFile?.name || 'original_video'}>
                <Download className="mr-2 h-4 w-4" />
                Download Video (Original)
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
