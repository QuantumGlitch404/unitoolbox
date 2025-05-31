
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
import 'jspdf-autotable';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import html2canvas from 'html2canvas';


const iconMap: { [key: string]: React.ElementType } = {
  FileText: FileText,
  FileCode: FileCodeIcon,
  FileSpreadsheet: FileSpreadsheet,
  Presentation: Presentation,
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
  }, [toast, currentConversion.accept]);

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
        
        setStatusMessage("Rendering HTML to PDF...");
        setConversionProgress(60);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        tempDiv.style.width = '210mm'; // A4 width
        tempDiv.style.padding = '10mm';
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
        document.body.removeChild(tempDiv);
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        convertedBlob = pdf.output('blob');
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;

      } else if (currentConversion.value === 'pdf-to-docx') {
        setStatusMessage("Extracting text from PDF...");
        setConversionProgress(30);
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
        const paragraphs: Paragraph[] = [];
        
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageTextRuns: TextRun[] = textContent.items.map((item: any) => new TextRun(item.str));
          if (pageTextRuns.length > 0) {
              // Group text items into paragraphs, simple approach by joining all text on page
              // A more sophisticated approach would analyze text item positions (y-coordinates)
              let currentLine = "";
              textContent.items.forEach((item: any, index: number) => {
                  currentLine += item.str;
                   if(item.hasEOL || index === textContent.items.length -1) {
                       paragraphs.push(new Paragraph({children: [new TextRun(currentLine)] }));
                       currentLine = "";
                   } else {
                       currentLine += " "; // Add space between text items not ending a line
                   }
              });
          }
          if (i < pdfDoc.numPages) { // Add a page break paragraph (optional)
            // paragraphs.push(new Paragraph({children: [new TextRun({break: 1})]}) );
          }
          setConversionProgress(30 + Math.floor((i / pdfDoc.numPages) * 60));
        }

        setStatusMessage("Generating DOCX file...");
        const doc = new Document({ sections: [{ children: paragraphs }] });
        const buffer = await Packer.toBuffer(doc);
        convertedBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        convertedFileName = `${selectedFile.name.split('.')[0]}.docx`;
        conversionNote = "PDF content converted to .docx with basic paragraph structure. Complex formatting may be lost.";

      } else if (currentConversion.value === 'xlsx-to-pdf') {
        setStatusMessage("Parsing Excel file...");
        setConversionProgress(30);
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
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
        convertedBlob = pdf.output('blob');
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;

      } else if (currentConversion.value === 'pdf-to-xlsx') {
        setStatusMessage("Extracting text from PDF for Excel...");
        setConversionProgress(30);
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
        const dataForExcel: string[][] = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          // Heuristic: treat each line of text as a row, split by multiple spaces for columns
          // This is very basic and will need refinement for real table extraction
          textContent.items.forEach((item: any) => {
            if (item.str.trim()) { // Only consider non-empty lines
                // A very simple heuristic for columns: split by 3 or more spaces.
                // This is highly unreliable for general PDFs.
                const cells = item.str.split(/\s{3,}/).map((cell:string) => cell.trim());
                if(cells.some((cell:string) => cell.length > 0)) { // only add if there's some content
                    dataForExcel.push(cells);
                }
            }
          });
           setConversionProgress(30 + Math.floor((i / pdfDoc.numPages) * 60));
        }
        
        setStatusMessage("Generating XLSX file...");
        const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        convertedBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        convertedFileName = `${selectedFile.name.split('.')[0]}.xlsx`;
        conversionNote = "Attempted to extract text into .xlsx. Table structure depends heavily on PDF format; results may vary.";

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
            console.warn("Mammoth.js failed on PPTX, using PptxGenJS as fallback for metadata only for now", e);
            // Fallback: PptxGenJS cannot read existing PPTX. This path will not produce content.
            const pdf = new jsPDF();
            pdf.text("Client-side PPTX to PDF conversion is very limited.\nCould not extract text using current methods for this file.", 10, 10);
            convertedBlob = pdf.output('blob');
            conversionNote = "Could not extract text from PPTX. Complex PPTX not supported by client-side text extraction.";
        }
        convertedFileName = `${selectedFile.name.split('.')[0]}.pdf`;
        if(!conversionNote) conversionNote = "Simplified PPTX to PDF: Extracts basic text. Formatting, images, and slide structure are lost.";
      
      } else if (currentConversion.value === 'pdf-to-pptx') {
        setStatusMessage("Rendering PDF pages as images for PPTX...");
        setConversionProgress(20);
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;
        const numPages = pdfDoc.numPages;
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_BLANK';

        for (let i = 0; i < numPages; i++) {
          setStatusMessage(`Processing PDF page ${i + 1} of ${numPages} for PPTX...`);
          setConversionProgress(20 + Math.floor(((i + 1) / numPages) * 70));
          
          const page = await pdfDoc.getPage(i + 1);
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better image quality
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if(!context) throw new Error("Canvas context not available for PDF page rendering.");
          
          context.fillStyle = 'white'; // Ensure background is white for transparent PDFs
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: context, viewport }).promise;
          const imageDataUrl = canvas.toDataURL('image/png');

          const slide = pptx.addSlide();
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
        const dataUrl = URL.createObjectURL(convertedBlob); // For potential immediate preview, not used currently
        setStatusMessage("Conversion successful!");
        setResult({ name: convertedFileName, dataUrl: dataUrl, blob: convertedBlob });
        addToHistory({
          fileName: selectedFile.name,
          originalFormat: currentConversion.sourceFormat,
          targetFormat: currentConversion.targetFormat,
          status: 'success',
          // downloadUrl: dataUrl, // Not storing blob URLs in history as they expire
          downloadName: convertedFileName,
        });
        toast({ title: "Conversion Complete!", description: (conversionNote ? `${conversionNote} ` : '') + `${convertedFileName} is ready for download below.` });
      } else {
        throw new Error("Conversion process did not produce an output file.");
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
                      {selectedFile.type === 'application/pdf' ? 'PDF Preview (first page)' : 'No preview available for this file type.'}
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
                    <Button variant="outline" size="sm" onClick={() => {
                      // This re-download attempt for history might fail if blob URL expired.
                      // For true re-download, you'd need to re-run conversion or store blobs temporarily if small enough.
                      // For now, it's just a placeholder if the url was a blob url.
                      toast({ title: "Re-Download", description: "Re-download from history might require re-conversion if original Blob URL expired.", duration: 5000});
                      // If you were to implement re-download, you'd need to find the original file or re-run the conversion.
                      // triggerDownload(item.downloadUrl!, item.downloadName!);
                    }}>
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
            <li>Conversions are processed directly in your browser. No files are uploaded to any server by this tool.</li>
            <li>**Fidelity Limitations**: Client-side conversion of complex document formats (especially PDF to Word/Excel) can result in loss of formatting, layout, and images. Results are best with simpler documents.</li>
            <li>**PDF to Word**: Generates a .docx file with extracted text content structured into basic paragraphs. Complex layouts, fonts, and images from the PDF are generally not preserved.</li>
            <li>**PDF to Excel**: Attempts to extract tabular text into an .xlsx file. This is highly dependent on the PDF's structure and works best for text-based tables. Formatting is not preserved.</li>
            <li>**Word/Excel/PowerPoint to PDF**: Formatting preservation varies. Word to PDF attempts to maintain layout by rendering HTML to an image. Excel to PDF focuses on table data. PowerPoint to PDF extracts basic text.</li>
            <li>**Performance**: Larger files or more complex documents may take longer to process and could impact browser performance.</li>
          </ul>
        </AlertDescription>
      </Alert>

    </div>
  );
}
