
"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Copy, Sparkles, Loader2, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

type SummaryLength = "short" | "medium" | "long";

const BookSummaryCreatorClient = () => {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [detailLevel, setDetailLevel] = useState(50); // 0-100
  const [isLoading, setIsLoading] = useState(false);

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

  const handleGenerateSummary = () => {
    if (!inputText.trim()) {
      toast({ title: "Error", description: "Please enter text to summarize.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSummary('');

    // Simulate AI summarization
    setTimeout(() => {
      let output = "Conceptual Summary: ";
      const words = inputText.split(' ');
      let len;
      switch(summaryLength) {
        case 'short': len = Math.min(words.length, 25 + Math.floor(detailLevel/10)); break; // 25-35 words
        case 'medium': len = Math.min(words.length, 75 + Math.floor(detailLevel/5)); break; // 75-95 words
        case 'long': len = Math.min(words.length, 150 + Math.floor(detailLevel/2)); break; // 150-200 words
        default: len = Math.min(words.length, 75);
      }
      output += words.slice(0, len).join(' ') + (words.length > len ? '...' : '');
      
      // Placeholder for key points
      if (words.length > 10) {
        output += "\n\nKey Points (Conceptual):\n- Point 1 based on text analysis.\n- Point 2 related to main themes.\n- Point 3 highlighted by conceptual AI.";
      }
      setSummary(output);
      setIsLoading(false);
      toast({ title: "Summary Generated (Conceptual)", description: "AI features are simulated." });
    }, 1500);
  };

  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary)
      .then(() => toast({ title: "Copied!", description: "Summary copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Failed to copy summary.", variant: "destructive" }));
  };
  
  const handleDownloadSummary = (format: 'txt' | 'pdf') => {
    if (!summary) return;
    const blob = new Blob([summary], { type: format === 'txt' ? 'text/plain' : 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: `summary.${format}`});
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
              <Label htmlFor="detailLevel">Summary Detail Slider (Conceptual): {detailLevel}%</Label>
              <Slider id="detailLevel" value={[detailLevel]} onValueChange={(val) => setDetailLevel(val[0])} min={0} max={100} step={10} disabled/>
            </div>
            <Button onClick={handleGenerateSummary} disabled={isLoading || !inputText.trim()} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Summary (Conceptual AI)
            </Button>
            <p className="text-xs text-muted-foreground">Chapter-wise summarization is a conceptual feature.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
            <CardDescription>Review the conceptual summary below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={summary} readOnly placeholder="Summary will appear here..." className="min-h-[300px] bg-muted/30" />
            {summary && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopySummary} variant="outline"><Copy className="mr-2 h-4 w-4"/>Copy</Button>
                <Button onClick={() => handleDownloadSummary('txt')} variant="outline"><FileText className="mr-2 h-4 w-4"/>Download .txt</Button>
                <Button onClick={() => handleDownloadSummary('pdf')} variant="outline" disabled><Download className="mr-2 h-4 w-4"/>Download .pdf (Conceptual)</Button>
              </div>
            )}
            <Button variant="ghost" size="sm" disabled>Save Summary Locally (Conceptual)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { BookSummaryCreatorClient };

