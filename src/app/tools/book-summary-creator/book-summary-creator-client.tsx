
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Copy, Sparkles, Loader2, FileText, Save, BookOpen } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { summarizeEssay, type SummarizeEssayInput } from '@/ai/flows/essay-summarizer';
import jsPDF from 'jspdf';

type SummaryLength = "short" | "medium" | "long";
const LOCAL_STORAGE_KEY = "bookSummaryCreator_lastSummary";

const BookSummaryCreatorClient = () => {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [detailLevel, setDetailLevel] = useState(50); // 0-100
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load last saved summary on initial mount
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const { text, generatedSummary, length, detail } = JSON.parse(saved);
        setInputText(text || '');
        setSummary(generatedSummary || '');
        setSummaryLength(length || 'medium');
        setDetailLevel(detail || 50);
        if (generatedSummary) {
            toast({ title: "Loaded Last Summary", description: "Your previously generated summary has been loaded." });
        }
      }
    } catch (e) {
        console.error("Failed to load from local storage", e);
    }
  }, [toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setInputText(e.target?.result as string || '');
          toast({ title: "File Loaded", description: `${file.name} content loaded.`});
        };
        reader.readAsText(file);
      } else {
        toast({ title: "Invalid File", description: "Please upload a .txt file.", variant: "destructive"});
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    multiple: false
  });

  const getDetailAdjective = (level: number): string => {
    if (level < 25) return "very brief";
    if (level < 50) return "concise";
    if (level < 75) return "moderately detailed";
    return "highly detailed";
  };

  const getLengthInstruction = (length: SummaryLength): string => {
    if (length === 'short') return "a short, one to two paragraph summary";
    if (length === 'medium') return "a medium length summary, about three to five paragraphs";
    return "a long, comprehensive summary with multiple paragraphs per major section";
  };

  const handleGenerateSummary = async () => {
    if (!inputText.trim()) {
      toast({ title: "Error", description: "Please enter text to summarize.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSummary('');

    const lengthInstruction = getLengthInstruction(summaryLength);
    const detailAdjective = getDetailAdjective(detailLevel);

    const fullPrompt = `
      Please generate ${lengthInstruction} for the following text.
      The summary should be ${detailAdjective}.
      Identify and list up to 5 key points or main ideas from the text.
      If the text appears to have distinct chapters or sections, please try to structure your summary accordingly, mentioning these sections if possible.

      Original Text:
      ---
      ${inputText}
      ---
    `;

    try {
      const result = await summarizeEssay({ essay: fullPrompt });
      setSummary(result.summary);
      toast({ title: "Summary Generated!", description: "AI has generated your summary." });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ text: inputText, generatedSummary: result.summary, length: summaryLength, detail: detailLevel }));
      } catch (e) {
        console.error("Failed to save to local storage", e);
        toast({ title: "Local Save Failed", description: "Could not save summary locally. Storage might be full.", variant: "warning" });
      }
    } catch (error: any) {
      console.error("Error generating summary:", error);
      setSummary("Failed to generate summary. Please try again.");
      toast({
        title: "AI Error",
        description: error.message || "Could not generate summary.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary)
      .then(() => toast({ title: "Copied!", description: "Summary copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy summary.", variant: "destructive" }));
  };
  
  const handleDownloadSummary = (format: 'txt' | 'pdf') => {
    if (!summary) {
        toast({ title: "Nothing to download", description: "Please generate a summary first.", variant: "destructive" });
        return;
    }
    const blob = new Blob([summary], { type: format === 'txt' ? 'text/plain;charset=utf-8;' : 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    if (format === 'txt') {
        a.download = `summary.txt`;
    } else { // PDF
        const pdf = new jsPDF();
        const lines = pdf.splitTextToSize(summary, pdf.internal.pageSize.getWidth() - 20);
        let y = 15;
        const pageHeight = pdf.internal.pageSize.getHeight() - 20;
        lines.forEach((line: string) => {
            if(y > pageHeight) {
                pdf.addPage();
                y = 15;
            }
            pdf.text(line, 10, y);
            y += 7; // line height
        });
        pdf.save('summary.pdf');
        URL.revokeObjectURL(url); // Clean up blob URL for txt only, pdf.save handles its own.
        toast({ title: "Download Started", description: `summary.pdf`});
        return; // Return early for PDF as jsPDF handles download
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: `summary.${format}`});
  };

  const handleLoadLastSummary = () => {
     try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const { text, generatedSummary, length, detail } = JSON.parse(saved);
        setInputText(text || '');
        setSummary(generatedSummary || '');
        setSummaryLength(length || 'medium');
        setDetailLevel(detail || 50);
        toast({ title: "Last Summary Loaded", description: "Restored from local storage." });
      } else {
        toast({ title: "No Saved Summary", description: "Nothing found in local storage.", variant: "default" });
      }
    } catch (e) {
        console.error("Failed to load from local storage", e);
        toast({ title: "Load Error", description: "Could not load from local storage.", variant: "destructive" });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>Paste your book text or upload a .txt file.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] mb-4"
            />
            <div
              {...getRootProps()}
              className={`p-6 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'}`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              {isDragActive ? <p>Drop .txt file here...</p> : <p>Drag 'n' drop .txt file, or click to select</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Summary Length</Label>
              <RadioGroup value={summaryLength} onValueChange={(val) => setSummaryLength(val as SummaryLength)} className="flex space-x-4">
                {(['short', 'medium', 'long'] as SummaryLength[]).map(len => (
                  <div key={len} className="flex items-center space-x-2">
                    <RadioGroupItem value={len} id={`len-${len}`} />
                    <Label htmlFor={`len-${len}`} className="capitalize">{len}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="detailLevel">Summary Detail Level: {detailLevel}%</Label>
              <Slider id="detailLevel" value={[detailLevel]} onValueChange={(val) => setDetailLevel(val[0])} min={0} max={100} step={10} />
            </div>
            <Button onClick={handleGenerateSummary} disabled={isLoading || !inputText.trim()} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Summary with AI
            </Button>
            <p className="text-xs text-muted-foreground">Chapter-wise summarization and key point extraction will be attempted by the AI based on the prompt.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
            <CardDescription>Review the AI-generated summary below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={summary} readOnly placeholder="Summary will appear here..." className="min-h-[300px] bg-muted/30 whitespace-pre-wrap" />
            {summary && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopySummary} variant="outline"><Copy className="mr-2 h-4 w-4"/>Copy</Button>
                <Button onClick={() => handleDownloadSummary('txt')} variant="outline"><FileText className="mr-2 h-4 w-4"/>Download .txt</Button>
                <Button onClick={() => handleDownloadSummary('pdf')} variant="outline"><Download className="mr-2 h-4 w-4"/>Download .pdf</Button>
              </div>
            )}
             <Button onClick={handleLoadLastSummary} variant="ghost" size="sm">
                <BookOpen className="mr-2 h-4 w-4" /> Load Last Saved Summary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { BookSummaryCreatorClient };
