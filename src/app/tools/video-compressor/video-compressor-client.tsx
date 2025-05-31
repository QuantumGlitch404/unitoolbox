
"use client";

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, Download, Loader2, XCircle, Settings2 } from 'lucide-react';

interface EncodingResult {
  name: string;
  originalSize: number;
  newSize: number;
  reductionPercent: number;
  dataUrl: string;
  newWidth: number;
  newHeight: number;
}

const resolutionScales = [
  { label: "Original", value: 1.0 },
  { label: "75%", value: 0.75 },
  { label: "50%", value: 0.5 },
  { label: "25% (Fastest, Smallest)", value: 0.25 },
];

export function VideoCompressorClient() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [resolutionScale, setResolutionScale] = useState(0.75);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<EncodingResult | null>(null);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

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
      if (videoPreview) URL.revokeObjectURL(videoPreview); // Revoke previous preview
      setVideoPreview(URL.createObjectURL(file));
      setResult(null);
      setProgress(0);
      toast({
        title: "Video Selected",
        description: `${file.name} is ready for re-encoding.`,
      });
    }
  }, [toast, videoPreview]);

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

  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    if (videoRef.current) {
      videoRef.current.pause();
      // Unbind handlers before changing src to prevent spurious errors after successful operations
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onerror = null;
      videoRef.current.src = ""; // Release resources
    }
    setIsLoading(false);
  };

  const handleReEncodeVideo = async () => {
    if (!videoFile || !videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Video file or necessary elements not ready.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);
    recordedChunksRef.current = [];

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext('2d');

    if (!ctx) {
      toast({ title: "Canvas Error", description: "Could not get canvas context.", variant: "destructive" });
      cleanup();
      return;
    }

    videoElement.onloadedmetadata = () => {
      const originalWidth = videoElement.videoWidth;
      const originalHeight = videoElement.videoHeight;
      const newWidth = Math.floor(originalWidth * resolutionScale);
      const newHeight = Math.floor(originalHeight * resolutionScale);

      canvasElement.width = newWidth;
      canvasElement.height = newHeight;

      const frameRate = 25; 
      const canvasStream = canvasElement.captureStream(frameRate);
      
      let combinedStream = canvasStream;
      const videoAudioStream = (videoElement as any).captureStream?.() || (videoElement as any).mozCaptureStream?.();
      
      if (videoAudioStream) {
        const audioTracks = videoAudioStream.getAudioTracks();
        if (audioTracks.length > 0) {
            console.log("Attempting to add audio track to re-encoded video.");
            combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
        } else {
            console.warn("No audio tracks found in original video or captureStream did not provide them.");
        }
      } else {
        console.warn("Video element captureStream for audio not available. Video will likely be silent.");
      }

      try {
        mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp9' }); 
      } catch (e) {
        console.warn("WebM VP9 not supported, trying default MediaRecorder config.", e);
        try {
          mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm' }); 
        } catch (e2) {
           console.error("MediaRecorder setup failed for WebM. Trying MP4 if browser supports it.", e2);
           try {
             mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/mp4' });
           } catch (e3) {
            toast({ title: "Encoding Error", description: "MediaRecorder could not be initialized with supported codecs.", variant: "destructive" });
            cleanup();
            return;
           }
        }
      }
      
      const recorder = mediaRecorderRef.current;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType });
        const dataUrl = URL.createObjectURL(blob);
        const newSize = blob.size;
        const reductionPercent = ((videoFile.size - newSize) / videoFile.size) * 100;

        setResult({
          name: `reencoded_${videoFile.name.split('.')[0]}.${recorder.mimeType.split('/')[1].split(';')[0]}`,
          originalSize: videoFile.size,
          newSize,
          reductionPercent: parseFloat(reductionPercent.toFixed(2)),
          dataUrl,
          newWidth,
          newHeight,
        });
        toast({ title: "Re-encoding Complete!", description: `Video processed to ${newWidth}x${newHeight}. Audio preservation depends on browser support.` });
        cleanup();
      };
      
      recorder.onerror = (event: Event) => {
        let errorMessage = "MediaRecorder encountered an error during encoding.";
        if (event instanceof ErrorEvent) {
            errorMessage = event.message;
        } else if ((event as any).error && (event as any).error.message) {
            errorMessage = (event as any).error.message;
        }
        console.error("MediaRecorder error:", event);
        toast({title: "Encoding Error", description: errorMessage, variant: "destructive"});
        cleanup();
      };

      videoElement.currentTime = 0;
      videoElement.muted = true; 
      videoElement.play().catch(e => {
        console.error("Error playing video for processing:", e);
        toast({title: "Playback Error", description: "Could not start video processing.", variant: "destructive"});
        cleanup();
      });
      if (recorder.state === "inactive") { // Check if recorder might have already errored out
        recorder.start();
      }


      const drawFrame = () => {
        if (!videoElement || videoElement.paused || videoElement.ended || !mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
             mediaRecorderRef.current.stop();
          }
          return;
        }
        ctx.drawImage(videoElement, 0, 0, newWidth, newHeight);
        setProgress((videoElement.currentTime / videoElement.duration) * 100);
        requestAnimationFrame(drawFrame);
      };
      requestAnimationFrame(drawFrame);
    };
    
    videoElement.onerror = (e) => {
        // This error handler is primarily for issues loading the initial video file.
        // It should not be triggered by cleanup actions if handlers are correctly removed.
        console.error("Error loading video metadata:", e);
        toast({title: "Video Load Error", description: "Could not load video metadata for processing. The file might be corrupt or an unsupported format.", variant: "destructive"});
        cleanup();
    };

    if (videoPreview) {
      videoElement.src = videoPreview;
    } else {
      toast({title: "File Error", description: "No video preview available to process.", variant: "destructive"});
      cleanup();
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setResult(null);
    setProgress(0);
    cleanup();
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
      <video ref={videoRef} style={{ display: 'none' }} crossOrigin="anonymous"></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Video File</CardTitle>
          <CardDescription>Select a video to re-encode. Supported: MP4, WebM, MOV, AVI, MKV.</CardDescription>
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
            <CardTitle className="font-headline text-xl">Re-encoding Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resolutionScale">Resolution Scale</Label>
              <Select
                value={resolutionScale.toString()}
                onValueChange={(value) => setResolutionScale(parseFloat(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="resolutionScale" aria-label="Resolution scale">
                  <SelectValue placeholder="Select scale" />
                </SelectTrigger>
                <SelectContent>
                  {resolutionScales.map(scale => (
                    <SelectItem key={scale.value} value={scale.value.toString()}>
                      {scale.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Lower scale reduces file size and processing time, but also quality.</p>
            </div>
            <Button onClick={handleReEncodeVideo} disabled={isLoading || !videoFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2 className="mr-2 h-4 w-4" />}
              Re-encode Video
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Re-encoding Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>File Name:</strong> {result.name}</p>
            <p><strong>Original Size:</strong> {formatBytes(result.originalSize)}</p>
            <p><strong>New Size:</strong> {formatBytes(result.newSize)}</p>
            <p><strong>Reduction:</strong> <span className={result.reductionPercent > 0 ? "text-green-500" : "text-red-500"}>{result.reductionPercent.toFixed(2)}%</span></p>
            <p><strong>New Dimensions:</strong> {result.newWidth}x{result.newHeight}</p>
            <Button
              asChild
              className="w-full sm:w-auto"
              aria-label={`Download ${result.name}`}
            >
              <a href={result.dataUrl} download={result.name}>
                <Download className="mr-2 h-4 w-4" />
                Download Re-encoded Video
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

