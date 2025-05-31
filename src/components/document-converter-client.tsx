
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, XCircle, AlertTriangle, ArrowRightLeft, FileText, FileSpreadsheet, FilePresentation, FileCode as FileCodeIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as pdfjsLib from 'pdfjs-dist';

const iconMap: { [key: string]: React.ElementType } = {
  FileText: FileText,
  FileCode: FileCodeIcon,
  FileSpreadsheet: FileSpreadsheet,
  FilePresentation: FilePresentation,
};

interface ConversionOption {
  label: string;
  value: string; 
  sourceFormat: string; 
  targetFormat: string; 
  accept: Accept;
  sourceIconName: string;
  targetIconName: string;
}

interface DocumentConverterClientProps {
  toolName: string;
  conversionOptions: ConversionOption[];
  defaultConversionValue: string;
}

interface ConversionHistoryItem {
  id: string;
  fileName: string;
  originalFormat: string;
  targetFormat: string;
  status: 'success' | 'error';
  timestamp: number;
  downloadUrl?: string; 
  error?: string;
}

const simulateUploadToFirebaseStorage = (
  file: File,
  onProgress: (progress: number) => void,
  onComplete: (filePath: string) => void,
  onError: (error: Error) => void
) => {
  let progress = 0;
  onProgress(progress);

  const interval = setInterval(() => {
    progress += 20;
    if (progress <= 100) {
      onProgress(progress);
    } else {
      clearInterval(interval);
      onComplete(`uploads/${file.name}`);
    }
  }, 300); 
};

const simulateFirebaseFunctionCall = async (
  filePath: string,
  targetFormat: string
): Promise<{ downloadUrl: string; convertedFileName: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const randomId = Math.random().toString(36).substring(7);
      const convertedFileName = `${filePath.split('/').pop()?.split('.')[0]}_converted_${randomId}.${targetFormat}`;
      resolve({ downloadUrl: `https://placehold.co/100x100.png?text=Converted+${targetFormat.toUpperCase()}`, convertedFileName });
    }, 1500 + Math.random() * 1000); 
  });
};


export function DocumentConverterClient({
  toolName,
  conversionOptions,
  defaultConversionValue,
}: DocumentConverterClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversionProgress, setConversionProgress] = useState(0); 
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [result, setResult] = useState<{ name: string; dataUrl: string } | null>(null);
  const [conversionType, setConversionType] = useState<string>(defaultConversionValue);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);

  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentConversion = conversionOptions.find(opt => opt.value === conversionType) || conversionOptions[0];
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const workerSrcPath = `/pdf.worker.min.mjs`; 
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrcPath;
    }
  }, []);


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(`${toolName}-conversionHistory`);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
      localStorage.removeItem(`${toolName}-conversionHistory`);
    }
  }, [toolName]);

  const addToHistory = (item: Omit<ConversionHistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prev => {
      const newHistory = [
        { ...item, id: Date.now().toString(), timestamp: Date.now() },
        ...prev,
      ].slice(0, 5); 
      try {
        localStorage.setItem(`${toolName}-conversionHistory`, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage:", error);
      }
      return newHistory;
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setResult(null);
      setStatusMessage("");
      setUploadProgress(0);
      setConversionProgress(0);

      if (file.type === 'application/pdf' && file.size < 10 * 1024 * 1024) { // Limit preview for large PDFs
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result && canvasRef.current) {
            try {
              const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
              const loadingTask = pdfjsLib.getDocument({ data: typedArray });
              const pdf = await loadingTask.promise;
              const page = await pdf.getPage(1);
              const viewport = page.getViewport({ scale: 0.5 }); // Reduced scale for faster preview
              const canvas = canvasRef.current;
              const context = canvas.getContext('2d');
              if (!context) return;
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              const renderContext = { canvasContext: context, viewport: viewport };
              await page.render(renderContext).promise;
              setFilePreview(canvas.toDataURL());
            } catch (pdfError) {
              console.error("Error rendering PDF preview:", pdfError);
              setFilePreview(null); 
              toast({ title: "PDF Preview Error", description: "Could not generate PDF preview for this file.", variant: "default" });
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'application/pdf') {
        setFilePreview(null);
        toast({ title: "PDF Preview Skipped", description: "Preview is skipped for large PDF files to improve performance.", variant: "default" });
      }
      
      else {
        setFilePreview(null); 
      }

      toast({
        title: "File Selected",
        description: `${file.name} is ready for conversion.`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: currentConversion.accept,
    multiple: false,
  });

  const handleConvert = async () => {
    if (!selectedFile) {
      toast({ title: "No File", description: "Please upload a file first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setStatusMessage("Uploading file...");
    setUploadProgress(0);
    setConversionProgress(0);

    simulateUploadToFirebaseStorage(
      selectedFile,
      (progress) => setUploadProgress(progress),
      async (filePath) => {
        setUploadProgress(100);
        setStatusMessage(`Processing with backend (simulated)...`);
        
        try {
          const { downloadUrl, convertedFileName } = await simulateFirebaseFunctionCall(filePath, currentConversion.targetFormat);
          setConversionProgress(100);
          setStatusMessage("Conversion successful!");
          setResult({ name: convertedFileName, dataUrl: downloadUrl });
          addToHistory({
            fileName: selectedFile.name,
            originalFormat: currentConversion.sourceFormat,
            targetFormat: currentConversion.targetFormat,
            status: 'success',
            downloadUrl,
          });
          toast({ title: "Conversion Complete!", description: `${convertedFileName} is ready for download.` });
        } catch (error: any) {
          setStatusMessage(`Conversion failed: ${error.message}`);
          setConversionProgress(0);
          addToHistory({
            fileName: selectedFile.name,
            originalFormat: currentConversion.sourceFormat,
            targetFormat: currentConversion.targetFormat,
            status: 'error',
            error: error.message,
          });
          toast({ title: "Conversion Error", description: error.message || "An unknown error occurred during conversion.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setStatusMessage(`Upload failed: ${error.message}`);
        setIsLoading(false);
        setUploadProgress(0);
        addToHistory({
          fileName: selectedFile.name,
          originalFormat: currentConversion.sourceFormat,
          targetFormat: currentConversion.targetFormat,
          status: 'error',
          error: `Upload failed: ${error.message}`,
        });
        toast({ title: "Upload Error", description: error.message, variant: "destructive" });
      }
    );
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setResult(null);
    setStatusMessage("");
    setUploadProgress(0);
    setConversionProgress(0);
    toast({
      title: "File Removed",
      description: `You can now upload a new file.`,
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

  const SourceIconMapped = iconMap[currentConversion.sourceIconName] || FileText;
  const TargetIconMapped = iconMap[currentConversion.targetIconName] || FileText;


  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-primary/10 border-primary/30">
        <AlertTriangle className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-primary">Backend Implementation Required</AlertTitle>
        <AlertDescription className="text-primary/80">
          This tool provides the frontend UI for document conversion.
          Actual conversion requires implementing a Firebase Function with a third-party API (e.g., Aspose, GroupDocs, Adobe PDF Services).
          The current "Convert" button simulates this backend process.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Conversion Type</CardTitle>
          <CardDescription>Select the direction of your conversion.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={conversionType}
            onValueChange={(value) => {
              setConversionType(value);
              setSelectedFile(null); 
              setFilePreview(null);
              setResult(null);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {conversionOptions.map(opt => {
              const OptSourceIcon = iconMap[opt.sourceIconName] || FileText;
              const OptTargetIcon = iconMap[opt.targetIconName] || FileText;
              return (
                <Label
                  key={opt.value}
                  htmlFor={opt.value}
                  className="flex items-center space-x-3 p-4 border rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer has-[input:checked]:bg-accent has-[input:checked]:text-accent-foreground has-[input:checked]:border-primary"
                >
                  <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                  <OptSourceIcon className="h-6 w-6" />
                  <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                  <OptTargetIcon className="h-6 w-6" />
                  <span className="font-medium flex-1">{opt.label}</span>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload {currentConversion.sourceFormat.toUpperCase()} File</CardTitle>
          <CardDescription>Select a {currentConversion.sourceFormat.toLowerCase()} file to convert to {currentConversion.targetFormat.toLowerCase()}. Max 50MB.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedFile ? (
            <div className="space-y-4">
              <div className="relative w-full max-w-sm mx-auto border rounded-md p-4 bg-muted/20 min-h-[200px] flex items-center justify-center">
                {filePreview ? (
                  <Image src={filePreview} alt={`${currentConversion.sourceFormat} preview`} width={150} height={210} className="mx-auto border shadow-sm object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <SourceIconMapped className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm mt-2 text-muted-foreground">
                      {selectedFile.type === 'application/pdf' ? 'Preview skipped or unavailable.' : 'No preview for this file type.'}
                    </p>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10 rounded-full h-7 w-7"
                  onClick={handleRemoveFile}
                  aria-label={`Remove ${currentConversion.sourceFormat} file`}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">{selectedFile.name} ({formatBytes(selectedFile.size)})</p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-10 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'}`}
            >
              <input {...getInputProps()} aria-label={`${currentConversion.sourceFormat} file upload input`} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? (
                <p className="text-primary">Drop the {currentConversion.sourceFormat.toLowerCase()} file here...</p>
              ) : (
                <p>Drag 'n' drop, or click to select file</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Accepted: {Object.values(currentConversion.accept).flat().join(', ')}. Max 50MB.
              </p>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </CardContent>
      </Card>

      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Convert to {currentConversion.targetFormat.toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConvert} disabled={isLoading || !selectedFile} className="w-full sm:w-auto text-base py-3 px-6">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRightLeft className="mr-2 h-5 w-5" />}
              Convert File
            </Button>
            {isLoading && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
                {uploadProgress < 100 && uploadProgress > 0 && <Progress value={uploadProgress} className="w-full h-2" />}
                {uploadProgress === 100 && conversionProgress < 100 && <Progress value={conversionProgress} className="w-full h-2 bg-accent" />}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Conversion Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <TargetIconMapped className="h-16 w-16 text-primary mx-auto" />
            <p className="font-medium">{result.name}</p>
            <Button
              asChild
              className="w-full sm:w-auto text-base py-3 px-6"
              aria-label={`Download ${result.name}`}
            >
              <a href={result.dataUrl} download={result.name}>
                <Download className="mr-2 h-5 w-5" /> Download Converted File
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recent Conversions (Session)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {history.map(item => (
                <li key={item.id} className="flex justify-between items-center p-3 border rounded-md bg-background/50">
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs" title={item.fileName}>{item.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.originalFormat.toUpperCase()} to {item.targetFormat.toUpperCase()} - {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {item.status === 'success' && item.downloadUrl ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.downloadUrl} download={`${item.fileName.split('.')[0]}_converted.${item.targetFormat}`}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-destructive" title={item.error}>Error</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
