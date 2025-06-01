
"use client";

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, Wand2, Copy, XCircle, Mic, MicOff, FileText as FileTextIcon, FileCode2, BookText } from 'lucide-react';
import { transcribeAudio, type TranscribeAudioInput } from '@/ai/flows/audio-to-text-flow';
import { formatText, type FormatTextInput } from '@/ai/flows/format-transcribed-text-flow';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

type ProcessStage = "idle" | "transcribing" | "formatting" | "complete" | "error";

export function VoiceNotesToTextClient() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processStage, setProcessStage] = useState<ProcessStage>("idle");
  const [rawTranscription, setRawTranscription] = useState<string | null>(null);
  const [formattedText, setFormattedText] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const resetState = () => {
    setAudioFile(null);
    if(audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview(null);
    setRawTranscription(null);
    setFormattedText(null);
    setProgress(0);
    setIsLoading(false);
    setProcessStage("idle");
    audioChunksRef.current = [];
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      resetState();
      const file = acceptedFiles[0];
      const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/webm'];
      if (!validAudioTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload a valid audio file.", variant: "destructive" });
        return;
      }
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      toast({ title: "Audio File Selected", description: `${file.name} ready for processing.` });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.webm']
    },
    multiple: false,
    disabled: isRecording,
  });

  const startRecording = async () => {
    resetState();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioFile(new File([audioBlob], "recording.webm", { type: "audio/webm"}));
        setAudioPreview(audioUrl);
        audioChunksRef.current = [];
        // Stop all tracks of the stream
        stream.getTracks().forEach(track => track.stop());
      };
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Click 'Stop Recording' when finished." });
    } catch (err) {
      console.error("Error starting recording:", err);
      toast({ title: "Recording Error", description: "Could not start recording. Check microphone permissions.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: "Recording Stopped", description: "Processing recording..." });
    }
  };

  const handleProcessAudio = async () => {
    if (!audioFile) {
      toast({ title: "No Audio", description: "Upload or record audio first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setRawTranscription(null);
    setFormattedText(null);
    
    // Transcription Stage
    setProcessStage("transcribing");
    setProgress(25);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const audioDataUri = reader.result as string;
        const transcribeInput: TranscribeAudioInput = { audioDataUri };
        const transcribeResult = await transcribeAudio(transcribeInput);
        setRawTranscription(transcribeResult.transcribedText);
        setProgress(50);

        // Formatting Stage
        setProcessStage("formatting");
        if (transcribeResult.transcribedText) {
          const formatInput: FormatTextInput = { rawText: transcribeResult.transcribedText };
          const formatResult = await formatText(formatInput);
          setFormattedText(formatResult.formattedText);
          setProgress(100);
          setProcessStage("complete");
          toast({ title: "Processing Complete!", description: "Audio transcribed and formatted." });
        } else {
          throw new Error("Transcription returned no text.");
        }
      };
      reader.onerror = () => {
        throw new Error("Could not read audio file.");
      };
      reader.readAsDataURL(audioFile);
    } catch (error: any) {
      console.error("Error processing audio:", error);
      setProcessStage("error");
      setProgress(0);
      toast({ title: "Processing Error", description: error.message || "Failed to process audio.", variant: "destructive" });
    } finally {
      // setIsLoading(false) will be handled when processStage is complete or error.
      // We keep isLoading true during the entire flow.
      if(processStage === 'error' || processStage === 'idle') setIsLoading(false);

    }
  };
  
  useEffect(() => {
    if (processStage === "complete" || processStage === "error") {
        setIsLoading(false);
    }
  }, [processStage]);


  const handleDownload = async (format: 'txt' | 'docx' | 'pdf') => {
    if (!formattedText) {
      toast({ title: "No Text", description: "No formatted text to download.", variant: "destructive" });
      return;
    }
    let blob: Blob;
    let filename = `voice_note.${format}`;

    if (format === 'txt') {
      blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8;' });
    } else if (format === 'docx') {
      const paragraphs: Paragraph[] = [];
      formattedText.split('\n').forEach(line => {
        if (line.startsWith('## ')) {
          paragraphs.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2 }));
        } else if (line.startsWith('* ')) {
          paragraphs.push(new Paragraph({ text: line.substring(2), bullet: { level: 0 } }));
        } else if (line.trim() !== '') {
          paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
        } else {
            paragraphs.push(new Paragraph({text: ""})); // Empty line for spacing
        }
      });
      const doc = new Document({ sections: [{ children: paragraphs }] });
      blob = await Packer.toBlob(doc);
    } else { // PDF
      const pdf = new jsPDF();
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(formattedText, 180); // 180 is width in mm for A4 minus margins
      
      let y = 15;
      const pageHeight = pdf.internal.pageSize.height - 20; // margins

      lines.forEach((line: string) => {
        if (y > pageHeight) {
          pdf.addPage();
          y = 15;
        }
        if (line.startsWith('## ')) {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(16);
            pdf.text(line.substring(3), 10, y);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
        } else if (line.startsWith('* ')) {
            pdf.text(`• ${line.substring(2)}`, 15, y);
        }
        else {
            pdf.text(line, 10, y);
        }
        y += 7; // line height
      });
      blob = pdf.output('blob');
    }

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: `Downloading ${filename}.` });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload or Record Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}
              ${isRecording ? 'cursor-not-allowed opacity-50' : 'hover:border-primary'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            {isDragActive ? <p className="text-primary">Drop audio file here...</p> : <p>Drag 'n' drop, or click to select audio file</p>}
            <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A, AAC, OGG, FLAC, WebM</p>
          </div>
          <div className="text-center text-muted-foreground my-2">OR</div>
          <div className="flex justify-center">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={isLoading} variant="outline">
                <Mic className="mr-2 h-4 w-4" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                <MicOff className="mr-2 h-4 w-4" /> Stop Recording
              </Button>
            )}
          </div>
          {audioPreview && (
             <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-center">Audio Preview:</p>
              <audio src={audioPreview} controls className="w-full" />
              <Button variant="outline" size="sm" onClick={resetState} className="w-full">
                <XCircle className="mr-2 h-4 w-4" /> Clear Uploaded/Recorded Audio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {audioFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Process Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleProcessAudio} disabled={isLoading || !audioFile} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Transcribe & Format with AI
            </Button>
            {isLoading && (
              <div className="mt-2 space-y-1">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {processStage === 'transcribing' && "Transcribing audio..."}
                  {processStage === 'formatting' && "Formatting text with AI..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {formattedText && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="font-headline text-xl">Formatted Text</CardTitle>
              <CardDescription>AI-organized transcription of your audio.</CardDescription>
            </div>
             <Button onClick={() => navigator.clipboard.writeText(formattedText).then(()=>toast({title: "Copied!"})).catch(()=>toast({title:"Copy failed", variant:"destructive"}))} variant="ghost" size="icon">
                  <Copy className="h-5 w-5" />
             </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formattedText}
              readOnly
              className="min-h-[250px] resize-y text-base bg-background/50 whitespace-pre-wrap"
              aria-label="Formatted text output"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => handleDownload('txt')} variant="outline" size="sm">
                <FileTextIcon className="mr-2 h-4 w-4" /> Download TXT
              </Button>
              <Button onClick={() => handleDownload('docx')} variant="outline" size="sm">
                <FileCode2 className="mr-2 h-4 w-4" /> Download DOCX
              </Button>
              <Button onClick={() => handleDownload('pdf')} variant="outline" size="sm">
                <BookText className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
