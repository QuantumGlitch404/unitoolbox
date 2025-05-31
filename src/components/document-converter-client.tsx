
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, XCircle, ArrowRightLeft, FileText, FileSpreadsheet, Presentation, FileCode as FileCodeIcon, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For better table rendering in PDF for Excel
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';


const iconMap: { [key: string]: React.ElementType } = {
  FileText: FileText,
  FileCode: FileCodeIcon,
  FileSpreadsheet: FileSpreadsheet,
  Presentation: Presentation,
};

interface ConversionOption {
  label: string;
  value: string; // e.g., "docx-to-pdf"
  sourceFormat: string; // e.g., "docx"
  targetFormat: string; // e.g., "pdf"
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
  downloadUrl?: string; // data URI for client-side
  downloadName?: string;
  error?: string;
}

export function DocumentConverterClient({
  toolName,
  conversionOptions,
  defaultConversionValue,
}: DocumentConverterClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    const newItem = { ...item, id: Date.now().toString(), timestamp: Date.now() };
    setHistory(prev => {
      const newHistory = [newItem, ...prev].slice(0, 5);
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
      if (file.size > 25 * 1024 * 1024) { // 25MB limit for client-side processing
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 25MB for client-side conversion.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setResult(null);
      setStatusMessage("");
      setConversionProgress(0);

      if (file.type === 'application/pdf' && file.size < 5 * 1024 * 1024) { // PDF preview for smaller files
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result && canvasRef.current) {
            try {
              const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
              const loadingTask = pdfjsLib.getDocument({ data: typedArray });
              const pdf = await loadingTask.promise;
              const page = await pdf.getPage(1);
              const viewport = page.getViewport({ scale: 0.3 });
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
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
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

  const triggerDownload = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(dataUrl); // Clean up
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast({ title: "No File", description: "Please upload a file first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setStatusMessage(`Converting ${selectedFile.name}...`);
    setConversionProgress(20); // Initial progress

    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      let convertedBlob: Blob | null = null;
      let convertedFileName = `${selectedFile.name.split('.')[0]}_converted.${currentConversion.targetFormat}`;
      let conversionNote: string | null = null;

      // --- Word to PDF ---
      if (currentConversion.value === 'docx-to-pdf') {
        setStatusMessage("Converting Word to HTML...");
        setConversionProgress(40);
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer: fileBuffer });
        setStatusMessage("Generating PDF from HTML...");
        setConversionProgress(70);
        const pdf = new jsPDF();
        // Using jspdf.html - quality varies, might need more advanced HTML parsing for complex docs
        // For very basic text:
        const rawTextResult = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
        const lines = pdf.splitTextToSize(rawTextResult.value, pdf.internal.pageSize.getWidth() - 20);
        pdf.text(lines, 10, 10);

        convertedBlob = pdf.output('blob');
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;
      }
      // --- PDF to Word (Text Extraction) ---
      else if (currentConversion.value === 'pdf-to-docx') {
        setStatusMessage("Extracting text from PDF...");
        setConversionProgress(50);
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
        let fullText = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + "\n\n";
        }
        convertedBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        convertedFileName = `${selectedFile.name.split('.')[0]}.txt`;
        conversionNote = "PDF content extracted as plain text. Formatting and layout are not preserved in this client-side conversion.";
      }
      // --- Excel to PDF ---
      else if (currentConversion.value === 'xlsx-to-pdf') {
        setStatusMessage("Parsing Excel file...");
        setConversionProgress(40);
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        setStatusMessage("Generating PDF from Excel data...");
        setConversionProgress(70);
        const pdf = new jsPDF();
        (pdf as any).autoTable({
            head: jsonData.length > 0 ? [jsonData[0]] : [],
            body: jsonData.length > 1 ? jsonData.slice(1) : [],
            startY: 10,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' },
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
        });
        convertedBlob = pdf.output('blob');
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;
      }
      // --- PDF to Excel (CSV text extraction) ---
       else if (currentConversion.value === 'pdf-to-xlsx') {
        setStatusMessage("Extracting text for CSV...");
        setConversionProgress(50);
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
        let csvText = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          // Simple approach: join all text items on a page into a line, then join lines
          // More sophisticated table detection is very complex client-side
          csvText += textContent.items.map((item: any) => `"${item.str.replace(/"/g, '""')}"`).join(',') + "\n";
        }
        convertedBlob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
        convertedFileName = `${selectedFile.name.split('.')[0]}.csv`;
        conversionNote = "PDF content extracted page-by-page for CSV. Complex tables may not convert accurately.";
      }
      // --- PowerPoint to PDF (Simplified Text Extraction) ---
      else if (currentConversion.value === 'pptx-to-pdf') {
        setStatusMessage("Extracting text from PowerPoint (simplified)...");
        setConversionProgress(50);
        try {
            const rawTextResult = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
            const pdf = new jsPDF();
            const lines = pdf.splitTextToSize(rawTextResult.value || "No text could be extracted.", pdf.internal.pageSize.getWidth() - 20);
            pdf.text(lines, 10, 10);
            convertedBlob = pdf.output('blob');
        } catch (e) {
            // Mammoth might fail on PPTX. Fallback to simple message.
            const pdf = new jsPDF();
            pdf.text("Client-side PPTX to PDF conversion is very limited.\nCould not extract text using current method.", 10, 10);
            convertedBlob = pdf.output('blob');
        }
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;
        conversionNote = "Simplified PPTX to PDF: Only basic text content is extracted. All formatting, images, and slide structure are lost.";
      }
      // --- PDF to PowerPoint (Images on Slides) ---
      else if (currentConversion.value === 'pdf-to-pptx') {
        setStatusMessage("Rendering PDF pages as images...");
        setConversionProgress(30);
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const numPages = pdfDoc.getPageCount();
        const pptx = new PptxGenJS();

        for (let i = 0; i < numPages; i++) {
          setStatusMessage(`Processing page ${i + 1} of ${numPages} for PPTX...`);
          setConversionProgress(30 + Math.floor((i / numPages) * 60));
          
          const pdfPage = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise.then(doc => doc.getPage(i + 1));
          const viewport = pdfPage.getViewport({ scale: 1.5 }); // Adjust scale as needed
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if(!context) throw new Error("Canvas context not available");
          await pdfPage.render({ canvasContext: context, viewport }).promise;
          const imageDataUrl = canvas.toDataURL('image/png');

          const slide = pptx.addSlide();
          slide.addImage({ data: imageDataUrl, x: 0, y: 0, w: '100%', h: '100%' });
        }
        setStatusMessage("Generating PowerPoint file...");
        setConversionProgress(95);
        // pptxgenjs's writeFile triggers download directly for browser, or returns Promise<ArrayBuffer> for Node
        // For client-side, we want the blob to create an object URL.
        const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;
        convertedBlob = pptxBlob;
        convertedFileName = `${selectedFile.name.split('.')[0]}.pptx`;
      }

      if (convertedBlob) {
        setConversionProgress(100);
        const dataUrl = URL.createObjectURL(convertedBlob);
        setStatusMessage("Conversion successful!");
        setResult({ name: convertedFileName, dataUrl: dataUrl });
        addToHistory({
          fileName: selectedFile.name,
          originalFormat: currentConversion.sourceFormat,
          targetFormat: currentConversion.targetFormat,
          status: 'success',
          downloadUrl: dataUrl, // Store data URL for re-download if needed in session history
          downloadName: convertedFileName,
        });
        toast({ title: "Conversion Complete!", description: `${convertedFileName} is ready for download.` + (conversionNote ? ` ${conversionNote}` : '') });
        triggerDownload(dataUrl, convertedFileName); // Auto-download
      } else {
        throw new Error("Conversion resulted in no output. Selected conversion path might not be fully implemented yet.");
      }

    } catch (error: any) {
      console.error("Conversion Error:", error);
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
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setResult(null);
    setStatusMessage("");
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
      {/* Removed the "Backend Implementation Required" Alert */}

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
          <CardDescription>Select a {currentConversion.sourceFormat.toLowerCase()} file to convert to {currentConversion.targetFormat.toLowerCase()}. Max 25MB.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedFile ? (
            <div className="space-y-4">
              <div className="relative w-full max-w-sm mx-auto border rounded-md p-4 bg-muted/20 min-h-[150px] flex items-center justify-center">
                {filePreview ? (
                  <Image src={filePreview} alt={`${currentConversion.sourceFormat} preview`} width={100} height={140} className="mx-auto border shadow-sm object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <SourceIconMapped className="h-16 w-16 text-muted-foreground" />
                     <p className="text-sm mt-2 text-muted-foreground">
                      {selectedFile.type === 'application/pdf' ? 'PDF Preview' : 'No preview available.'}
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
                Accepted: {Object.values(currentConversion.accept).flat().join(', ')}. Max 25MB.
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
                <Progress value={conversionProgress} className="w-full h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      { !isLoading && result && ( // Only show result card if not loading and result exists
         <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Conversion Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <TargetIconMapped className="h-16 w-16 text-primary mx-auto" />
            <p className="font-medium">{result.name}</p>
            <Button
              onClick={() => triggerDownload(result.dataUrl, result.name)}
              className="w-full sm:w-auto text-base py-3 px-6"
              aria-label={`Download ${result.name}`}
            >
              <Download className="mr-2 h-5 w-5" /> Download Converted File
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
                     {item.status === 'error' && <p className="text-xs text-destructive truncate max-w-xs" title={item.error}>Error: {item.error}</p>}
                  </div>
                  {item.status === 'success' && item.downloadUrl && item.downloadName ? (
                    <Button variant="outline" size="sm" onClick={() => triggerDownload(item.downloadUrl!, item.downloadName!)}>
                      <Download className="mr-2 h-4 w-4" /> Re-Download
                    </Button>
                  ) : item.status === 'error' ? (
                    <span className="text-xs text-destructive p-2 rounded-md bg-destructive/10">Failed</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      <Alert variant="default" className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Client-Side Conversion Notes</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Conversions are processed directly in your browser. No files are uploaded to a server for these operations.</li>
            <li>**Fidelity Limitations**: Complex formatting, layouts, and embedded objects (especially in PDF to Word/Excel/PowerPoint conversions) may not be perfectly preserved. Results are best with simpler documents.</li>
            <li>**PPTX to PDF**: This conversion is highly simplified, primarily extracting text content. Visuals and slide structure will be lost.</li>
            <li>**PDF to Word/Excel**: These tools focus on text extraction. PDF to Excel will attempt a CSV-like structure. Formatting is generally not retained.</li>
            <li>**Performance**: Larger files or more complex documents may take longer to process and could impact browser performance. A file size limit of 25MB is recommended.</li>
          </ul>
        </AlertDescription>
      </Alert>

    </div>
  );
}
