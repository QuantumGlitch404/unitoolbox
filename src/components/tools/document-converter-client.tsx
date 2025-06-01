
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, XCircle, ArrowRightLeft, FileText, FileSpreadsheet, FileCode as FileCodeIcon, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import html2canvas from 'html2canvas';

// Configure PDF.js worker from CDN, only in browser environment
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const iconMap: { [key: string]: React.ElementType } = {
  FileText: FileText,
  FileCode: FileCodeIcon,
  FileSpreadsheet: FileSpreadsheet,
  Info: Info,
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
  const [result, setResult] = useState<{ name: string; dataUrl: string, blob: Blob } | null>(null);
  const [conversionType, setConversionType] = useState<string>(defaultConversionValue);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);

  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentConversion = conversionOptions.find(opt => opt.value === conversionType) || conversionOptions[0];

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
      if (file.size > 25 * 1024 * 1024) { 
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

      if (file.type === 'application/pdf' && file.size < 5 * 1024 * 1024 && canvasRef.current) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result && canvasRef.current) {
            try {
              const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
              const loadingTask = pdfjsLib.getDocument({ data: typedArray });
              const pdf = await loadingTask.promise;
              if (pdf.numPages > 0) {
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
              }
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

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDocxToPdf = async (file: File): Promise<Blob> => {
    setStatusMessage("Converting Word to HTML...");
    setConversionProgress(30);
    
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
    // Inject style for black text to ensure visibility
    const styledHtml = `<style>body { color: black; font-family:sans-serif;margin:20px;} p{margin-bottom:10px;line-height:1.4;} h1,h2,h3,h4,h5,h6{margin-bottom:12px;margin-top:20px;} ul,ol{margin-left:20px;margin-bottom:10px;} table{border-collapse:collapse;width:100%;margin-bottom:10px;} th,td{border:1px solid #ccc;padding:4px;text-align:left;} </style>${html}`;

    setStatusMessage("Rendering HTML to PDF...");
    setConversionProgress(60);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = styledHtml;
    tempDiv.style.width = '794px'; 
    tempDiv.style.padding = '40px'; 
    tempDiv.style.backgroundColor = 'white'; // Ensure white background for html2canvas
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px'; 
    tempDiv.style.fontFamily = 'Arial, sans-serif'; 
    document.body.appendChild(tempDiv);
    
    const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    document.body.removeChild(tempDiv);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] 
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    return pdf.output('blob');
  };

  const handlePdfToDocx = async (file: File): Promise<Blob> => {
    setStatusMessage("Extracting text from PDF...");
    setConversionProgress(20);
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const paragraphs: Paragraph[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      let pageText = "";
      // Concatenate text items, trying to respect line breaks if hasEOL is present or by y-coordinate similarity.
      // This is a simplified approach for text extraction.
      let lastY = -1;
      textContent.items.forEach((item: any) => { // item is TextItem
        if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > (item.height || 10) * 0.5) { // Heuristic for new line
            pageText += "\n";
        }
        pageText += item.str + (item.hasEOL ? "\n" : "");
        lastY = item.transform[5];
      });
      
      const lines = pageText.split('\n').map(line => line.trim()); // Split by explicit newlines now
      lines.forEach(line => {
        if (line.length > 0) { // Add only non-empty lines as paragraphs
            paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
        }
      });

      if (i < pdfDoc.numPages && lines.some(l => l.length > 0)) { // Add page break if there was content and it's not the last page
         paragraphs.push(new Paragraph({ children: [new TextRun({ text: "", break: 1 })]}));
      }
      setConversionProgress(20 + Math.floor((i / pdfDoc.numPages) * 60));
    }
    
    if (paragraphs.length === 0) {
        paragraphs.push(new Paragraph({ children: [new TextRun("No text content found in PDF.")]}));
    }
    setStatusMessage("Generating DOCX file...");
    setConversionProgress(85);
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const buffer = await Packer.toBuffer(doc);
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  };
  
  const handleXlsxToPdf = async (file: File): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    setStatusMessage("Parsing Excel file...");
    setConversionProgress(30);
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    
    setStatusMessage("Generating PDF from Excel data...");
    setConversionProgress(60);
    const pdf = new jsPDF('landscape'); 
    (pdf as any).autoTable({
        head: jsonData.length > 0 ? [jsonData[0].map(String)] : [],
        body: jsonData.length > 1 ? jsonData.slice(1).map(row => row.map(String)) : [],
        startY: 10, theme: 'grid', styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
        headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' },
        margin: { top: 10, right: 7, bottom: 10, left: 7 }, tableWidth: 'auto',
    });
    return pdf.output('blob');
  };

  const handlePdfToXlsx = async (file: File): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    setStatusMessage("Extracting text from PDF for Excel...");
    setConversionProgress(30);
    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const dataForExcel: string[][] = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Simplified: treat each text item as a cell in a new row.
      // This is very basic and won't preserve table structure accurately from complex PDFs.
      const pageRows: string[][] = [];
      let currentRow: string[] = [];
      let lastY = -Infinity;

      textContent.items.forEach((item: any) => { // item is TextItem
        if (item.str.trim() === '') return;

        // Heuristic to start a new row if y-coordinate changes significantly
        if (Math.abs(item.transform[5] - lastY) > (item.height || 10) * 0.7 && lastY !== -Infinity) {
          if (currentRow.length > 0) pageRows.push(currentRow);
          currentRow = [];
        }
        currentRow.push(item.str.trim());
        lastY = item.transform[5];
      });
      if (currentRow.length > 0) pageRows.push(currentRow); // Add last collected row
      
      pageRows.forEach(row => dataForExcel.push(row));

      if (pageNum < pdfDoc.numPages && pageRows.length > 0) dataForExcel.push([]); // Add an empty row as a separator between pages.

      setConversionProgress(30 + Math.floor((pageNum / pdfDoc.numPages) * 50));
    }
    
    if (dataForExcel.length === 0) {
        dataForExcel.push(["No text content extractable for Excel."]);
    }
    setStatusMessage("Generating XLSX file...");
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    setConversionProgress(90);
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };
  
  const handleConvert = async () => {
    if (!selectedFile) {
      toast({ title: "No File", description: "Please upload a file first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setStatusMessage(`Starting conversion of ${selectedFile.name}...`);
    setConversionProgress(5);

    try {
      let convertedBlob: Blob | null = null;
      let convertedFileName = `${selectedFile.name.split('.').slice(0, -1).join('.') || 'converted'}.${currentConversion.targetFormat}`;
      
      if (currentConversion.value === 'docx-to-pdf') {
        convertedBlob = await handleDocxToPdf(selectedFile);
      } else if (currentConversion.value === 'pdf-to-docx') {
        convertedBlob = await handlePdfToDocx(selectedFile);
      } else if (currentConversion.value === 'xlsx-to-pdf') {
        convertedBlob = await handleXlsxToPdf(selectedFile);
      } else if (currentConversion.value === 'pdf-to-xlsx') {
        convertedBlob = await handlePdfToXlsx(selectedFile);
      }

      if (convertedBlob) {
        setConversionProgress(100);
        const dataUrl = URL.createObjectURL(convertedBlob); 
        setStatusMessage("Conversion successful!");
        setResult({ name: convertedFileName, dataUrl: dataUrl, blob: convertedBlob });
        triggerDownload(convertedBlob, convertedFileName); 
        addToHistory({
          fileName: selectedFile.name,
          originalFormat: currentConversion.sourceFormat,
          targetFormat: currentConversion.targetFormat,
          status: 'success',
          downloadName: convertedFileName,
        });
        toast({ title: "Conversion Complete!", description: `${convertedFileName} download has started.` });
      } else {
        throw new Error("Unsupported conversion type or conversion failed to produce output.");
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
      toast({ title: "Conversion Error", description: error.message || "An unknown error occurred.", variant: "destructive", duration: 7000 });
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
    if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }
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
              handleRemoveFile(); 
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
                {filePreview && currentConversion.sourceFormat === 'pdf' ? (
                  <Image src={filePreview} alt={`${currentConversion.sourceFormat} preview`} width={100} height={140} className="mx-auto border shadow-sm object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <SourceIconMapped className="h-16 w-16 text-muted-foreground" />
                     <p className="text-sm mt-2 text-muted-foreground">
                      {currentConversion.sourceFormat === 'pdf' ? 'PDF Preview (first page, if small)' : 'No preview available for this file type.'}
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
      
      { !isLoading && result && ( 
         <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Conversion Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <TargetIconMapped className="h-16 w-16 text-primary mx-auto" />
            <p className="font-medium">{result.name}</p>
            <Button
              onClick={() => triggerDownload(result.blob, result.name)}
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
            <CardTitle className="font-headline text-xl">Recent Conversions</CardTitle>
            <CardDescription>Client-side conversion history (max 5).</CardDescription>
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
            <li>Conversions are processed directly in your browser. No files are uploaded to any server.</li>
            <li>
              **Fidelity & Limitations**: Client-side conversion of complex document formats can result in variations.
              PPTX to PDF primarily extracts text content. Visual fidelity is limited. PDF to PPTX converts pages to images on slides.
              PDF to Word/Excel involves text extraction and basic structuring; complex layouts may not be fully preserved.
            </li>
            <li>**Performance**: Larger files or more complex documents may take longer to process and could impact browser performance. A 25MB file size limit is suggested.</li>
             <li>**PDF.js Worker**: This tool uses a CDN-hosted worker for PDF processing. An internet connection is required for this component.</li>
          </ul>
        </AlertDescription>
      </Alert>

    </div>
  );
}
