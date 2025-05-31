
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

      if (file.type === 'application/pdf' && file.size < 5 * 1024 * 1024 && canvasRef.current) {
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
    URL.revokeObjectURL(dataUrl);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast({ title: "No File", description: "Please upload a file first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setStatusMessage(`Converting ${selectedFile.name}...`);
    setConversionProgress(10);

    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      let convertedBlob: Blob | null = null;
      let convertedFileName = `${selectedFile.name.split('.')[0]}_converted.${currentConversion.targetFormat}`;
      let conversionNote: string | null = null;

      if (currentConversion.value === 'docx-to-pdf') {
        setStatusMessage("Converting Word to HTML...");
        setConversionProgress(30);
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer: fileBuffer });
        setStatusMessage("Generating PDF from HTML...");
        setConversionProgress(60);
        const pdf = new jsPDF();
        try {
            // Attempt to render HTML. This is very basic and might not work for complex HTML.
            // jsPDF's html method is experimental and might require html2canvas for better results.
            // For simplicity, we'll just try to add text or simple elements.
            // A more robust solution involves html2canvas or a server-side converter.
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv); // Needs to be in DOM for some styles/rendering
            
            await pdf.html(tempDiv, {
                callback: function (doc) {
                    convertedBlob = doc.output('blob');
                },
                x: 10,
                y: 10,
                width: 180, // A4 width in mm approx, adjust as needed
                windowWidth: tempDiv.scrollWidth 
            });
            document.body.removeChild(tempDiv);
             if (!convertedBlob) { // Fallback to raw text if html method fails to produce blob
                const rawTextResult = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
                pdf.text(rawTextResult.value, 10, 10);
                convertedBlob = pdf.output('blob');
                conversionNote = "Converted as raw text; complex HTML to PDF failed client-side.";
            }

        } catch (htmlToPdfError) {
            console.warn("jsPDF html method failed, falling back to raw text:", htmlToPdfError);
            const rawTextResult = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
            pdf.text(rawTextResult.value, 10, 10); // Basic text rendering
            convertedBlob = pdf.output('blob');
            conversionNote = "Converted as raw text; HTML to PDF had issues.";
        }
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;
      } else if (currentConversion.value === 'pdf-to-docx') {
        setStatusMessage("Extracting text from PDF for TXT output...");
        setConversionProgress(50);
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
        let fullText = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + "\n\n";
          setConversionProgress(50 + Math.floor((i / pdfDoc.numPages) * 40));
        }
        convertedBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        convertedFileName = `${selectedFile.name.split('.')[0]}.txt`;
        conversionNote = "PDF content extracted as plain text (.txt). Formatting and layout are not preserved.";
      } else if (currentConversion.value === 'xlsx-to-pdf') {
        setStatusMessage("Parsing Excel file...");
        setConversionProgress(30);
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        setStatusMessage("Generating PDF from Excel data...");
        setConversionProgress(60);
        const pdf = new jsPDF('landscape'); // Often better for spreadsheets
        (pdf as any).autoTable({
            head: jsonData.length > 0 ? [jsonData[0].map(String)] : [], // Ensure headers are strings
            body: jsonData.length > 1 ? jsonData.slice(1).map(row => row.map(String)) : [], // Ensure body cells are strings
            startY: 10,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' },
            margin: { top: 10, right: 7, bottom: 10, left: 7 },
            tableWidth: 'auto',
        });
        convertedBlob = pdf.output('blob');
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;
      } else if (currentConversion.value === 'pdf-to-xlsx') {
        setStatusMessage("Extracting text from PDF for CSV output...");
        setConversionProgress(50);
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
        let csvText = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          // Simple approach: join all text items on a page into a line, then join lines
          const lineText = textContent.items.map((item: any) => `"${String(item.str).replace(/"/g, '""')}"`).join(',');
          csvText += lineText + "\n";
          setConversionProgress(50 + Math.floor((i / pdfDoc.numPages) * 40));
        }
        convertedBlob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
        convertedFileName = `${selectedFile.name.split('.')[0]}.csv`;
        conversionNote = "PDF content extracted as CSV. Table structure may vary. Recommended to review the output.";
      } else if (currentConversion.value === 'pptx-to-pdf') {
        setStatusMessage("Extracting text from PowerPoint (simplified)...");
        setConversionProgress(50);
        try {
            const rawTextResult = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
            const pdf = new jsPDF();
            const lines = pdf.splitTextToSize(rawTextResult.value || "No text could be extracted.", pdf.internal.pageSize.getWidth() - 40);
            pdf.text(lines, 20, 20);
            convertedBlob = pdf.output('blob');
        } catch (e) {
            console.warn("Mammoth.js failed on PPTX, possibly due to format or complexity.", e);
            const pdf = new jsPDF();
            pdf.text("Client-side PPTX to PDF conversion is very limited.\nCould not extract text using current method.\nTry a simpler PPTX or a dedicated server-side tool.", 10, 10);
            convertedBlob = pdf.output('blob');
        }
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;
        conversionNote = "Simplified PPTX to PDF: Extracts basic text. Formatting, images, and slide structure are lost.";
      } else if (currentConversion.value === 'pdf-to-pptx') {
        setStatusMessage("Rendering PDF pages as images for PPTX...");
        setConversionProgress(20);
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
        const numPages = pdfDoc.numPages;
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_BLANK'; // Use blank layout for full page images

        for (let i = 0; i < numPages; i++) {
          setStatusMessage(`Processing PDF page ${i + 1} of ${numPages} for PPTX...`);
          setConversionProgress(20 + Math.floor(((i + 1) / numPages) * 70));
          
          const page = await pdfDoc.getPage(i + 1);
          const viewport = page.getViewport({ scale: 1.5 }); 
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if(!context) throw new Error("Canvas context not available for PDF page rendering.");
          await page.render({ canvasContext: context, viewport }).promise;
          const imageDataUrl = canvas.toDataURL('image/png');

          const slide = pptx.addSlide();
          // PptxGenJS uses inches for dimensions by default. A4 is approx 8.27 x 11.69 inches.
          // We'll make the image fit the slide.
          slide.addImage({ data: imageDataUrl, x: 0, y: 0, w: '100%', h: '100%' });
        }
        setStatusMessage("Generating PowerPoint file...");
        setConversionProgress(95);
        const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;
        convertedBlob = pptxBlob;
        convertedFileName = `${selectedFile.name.split('.')[0]}.pptx`;
        conversionNote = "PDF converted to PPTX with each page as a static image. Content is not editable.";
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
          downloadUrl: dataUrl,
          downloadName: convertedFileName,
        });
        toast({ title: "Conversion Complete!", description: (conversionNote ? `${conversionNote} ` : '') + `${convertedFileName} is ready.` });
        // No auto-download here, user clicks the download button from the result card
      } else {
        throw new Error("Conversion process did not produce an output file. The selected conversion path might have encountered an issue or is not fully supported for this file type/complexity client-side.");
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
      toast({ title: "Conversion Error", description: error.message || "An unknown error occurred during conversion.", variant: "destructive", duration: 7000 });
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
          <CardDescription>Select a {currentConversion.sourceFormat.toLowerCase()} file to convert to {currentConversion.targetFormat.toLowerCase()}. Max 25MB for client-side processing.</CardDescription>
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
                      {selectedFile.type === 'application/pdf' ? 'PDF Preview' : 'No preview available for this file type.'}
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
                  {item.status === 'success' && item.downloadUrl && item.downloadName && (
                    <Button variant="outline" size="sm" onClick={() => triggerDownload(item.downloadUrl!, item.downloadName!)}>
                      <Download className="mr-2 h-4 w-4" /> Re-Download
                    </Button>
                  )}
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
            <li>**Fidelity Limitations**: Complex formatting, layouts, and embedded objects may not be perfectly preserved, especially in PDF to Word/Excel/PowerPoint conversions. Results are best with simpler documents.</li>
            <li>**PPTX to PDF**: This conversion is highly simplified, primarily extracting text content. Visuals and slide structure will likely be lost.</li>
            <li>**PDF to Word/Excel/TXT**: These tools focus on text extraction. PDF to Excel will attempt a CSV-like structure. Formatting is generally not retained. PDF to Word outputs a TXT file.</li>
            <li>**Performance**: Larger files or more complex documents may take longer to process and could impact browser performance. A file size limit of 25MB is recommended.</li>
            <li>**Browser Support**: Some advanced conversions rely on newer browser APIs and might have varying support across different browsers.</li>
          </ul>
        </AlertDescription>
      </Alert>

    </div>
  );
}
