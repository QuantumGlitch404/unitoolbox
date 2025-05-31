
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2, Wand2, Copy, XCircle, AudioLines } from 'lucide-react';
import { transcribeAudio, type TranscribeAudioInput } from '@/ai/flows/audio-to-text-flow';

export function AudioToTextClient() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null); // For <audio> tag
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/flac'];
      if (!validAudioTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an audio file (e.g., MP3, WAV, M4A, AAC, OGG, FLAC).",
          variant: "destructive",
        });
        return;
      }
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      setTranscribedText(null);
      toast({
        title: "Audio File Selected",
        description: `${file.name} is ready for AI transcription.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a', '.mp4'], // .mp4 can be audio-only
      'audio/aac': ['.aac'],
      'audio/ogg': ['.ogg'],
      'audio/flac': ['.flac']
    },
    multiple: false,
  });

  const handleTranscribeAudio = async () => {
    if (!audioFile) {
      toast({
        title: "No Audio File",
        description: "Please upload an audio file first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setTranscribedText(null);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress < 90) {
        setProgress(currentProgress);
      } else {
        clearInterval(progressInterval);
      }
    }, 200);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const audioDataUri = reader.result as string;
        const input: TranscribeAudioInput = { audioDataUri };
        try {
            const result = await transcribeAudio(input);
            setTranscribedText(result.transcribedText);
            setProgress(100);
            toast({
            title: "Transcription Complete!",
            description: "Audio has been successfully transcribed by AI.",
            });
        } catch (aiError: any) {
            console.error("Error transcribing audio with AI:", aiError);
            setTranscribedText("Failed to transcribe audio. The AI model might be unable to process this file or encountered an issue.");
            setProgress(0);
            toast({
            title: "AI Transcription Error",
            description: aiError.message || "Could not transcribe the audio file.",
            variant: "destructive",
            });
        } finally {
            clearInterval(progressInterval);
            setIsLoading(false);
        }
      };
      reader.onerror = () => {
        clearInterval(progressInterval);
        setIsLoading(false);
        setProgress(0);
        toast({
          title: "File Reading Error",
          description: "Could not read the audio file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(audioFile);

    } catch (error: any) {
      clearInterval(progressInterval);
      setIsLoading(false);
      setProgress(0);
      console.error("Error setting up audio transcription:", error);
      toast({
        title: "Processing Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleCopyText = () => {
    if (transcribedText) {
      navigator.clipboard.writeText(transcribedText)
        .then(() => toast({ title: "Copied!", description: "Transcribed text copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" }));
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    if(audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }
    setAudioPreview(null);
    setTranscribedText(null);
    setProgress(0);
    toast({
      title: "Audio File Removed",
      description: "You can now upload a new audio file.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Audio File</CardTitle>
          <CardDescription>Select an audio file (MP3, WAV, M4A, AAC, OGG, FLAC) to transcribe using AI.</CardDescription>
        </CardHeader>
        <CardContent>
          {audioPreview && audioFile ? (
             <div className="space-y-4">
              <div className="relative w-full max-w-md mx-auto border rounded-md p-4 bg-muted/30">
                <audio src={audioPreview} controls className="w-full" />
                 <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10 rounded-full h-7 w-7"
                    onClick={handleRemoveAudio}
                    aria-label="Remove audio file"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">{audioFile.name}</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
            >
              <input {...getInputProps()} aria-label="Audio upload input" />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? <p className="text-primary">Drop the audio file here...</p> : <p>Drag 'n' drop, or click to select</p>}
              <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A, AAC, OGG, FLAC supported</p>
            </div>
          )}
        </CardContent>
      </Card>

      {audioFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Transcribe Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTranscribeAudio} disabled={isLoading || !audioFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Transcribe Audio with AI
            </Button>
            {isLoading && <Progress value={progress} className="w-full mt-2 h-2" />}
          </CardContent>
        </Card>
      )}

      {transcribedText && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Transcribed Text (AI)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcribedText}
              readOnly
              className="min-h-[200px] resize-y text-base font-mono bg-background/50"
              aria-label="Transcribed text output"
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
