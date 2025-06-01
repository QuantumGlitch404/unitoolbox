
"use client";

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Loader2, AspectRatio, Palette, RefreshCw, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';

const DPI = 300; // Standard Dots Per Inch for printing

interface CountryPreset {
  name: string;
  widthMM: number;
  heightMM: number;
  widthInch?: number; // For display
  heightInch?: number; // For display
}

const countryPresets: CountryPreset[] = [
  { name: 'United States (2x2 inch)', widthMM: 50.8, heightMM: 50.8, widthInch: 2, heightInch: 2 },
  { name: 'India (35x45 mm)', widthMM: 35, heightMM: 45 },
  { name: 'United Kingdom (35x45 mm)', widthMM: 35, heightMM: 45 },
  { name: 'Schengen Visa (35x45 mm)', widthMM: 35, heightMM: 45 },
  { name: 'Canada (50x70 mm)', widthMM: 50, heightMM: 70 },
  // Add more presets as needed
];

const mmToPixels = (mm: number, dpi: number) => (mm / 25.4) * dpi;

export function PhotoToPassportSizeClient() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<CountryPreset>(countryPresets[0]);
  const [backgroundColor, setBackgroundColor] = useState<'white' | 'blue'>('white');
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultType, setResultType] = useState<'jpg' | 'pdf' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File Type", description: "Please upload JPG, PNG, or WebP.", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResultUrl(null);
      setResultType(null);
      toast({ title: "Image Selected", description: `${file.name} ready for processing.` });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    multiple: false,
  });

  const handleGenerate = async () => {
    if (!imageFile || !imagePreview || !canvasRef.current) {
      toast({ title: "Missing Image", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResultUrl(null);
    setResultType(null);

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate some processing

    try {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        const targetWidthPx = Math.round(mmToPixels(selectedPreset.widthMM, DPI));
        const targetHeightPx = Math.round(mmToPixels(selectedPreset.heightMM, DPI));
        canvas.width = targetWidthPx;
        canvas.height = targetHeightPx;

        // Fill background
        ctx.fillStyle = backgroundColor === 'blue' ? '#ADD8E6' : '#FFFFFF'; // Light blue or white
        ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);

        // Calculate aspect ratios
        const targetAspect = targetWidthPx / targetHeightPx;
        const imgAspect = img.naturalWidth / img.naturalHeight;

        let sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight;

        // This logic centers and "covers" the target area with the image, cropping as needed.
        if (imgAspect > targetAspect) { // Image is wider than target, fit height and crop width
          sHeight = img.naturalHeight;
          sWidth = sHeight * targetAspect;
          sx = (img.naturalWidth - sWidth) / 2;
          sy = 0;
        } else { // Image is taller than target, fit width and crop height
          sWidth = img.naturalWidth;
          sHeight = sWidth / targetAspect;
          sy = (img.naturalHeight - sHeight) / 2;
          sx = 0;
        }
        
        dx = 0;
        dy = 0;
        dWidth = targetWidthPx;
        dHeight = targetHeightPx;

        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Output as JPG
        setResultUrl(dataUrl);
        setResultType('jpg'); // Default to JPG download
        toast({ title: "Passport Photo Generated!", description: "Preview available below." });
      };
      img.onerror = () => {
        throw new Error("Failed to load uploaded image for processing.");
      };
      img.src = imagePreview;
    } catch (error: any) {
      console.error("Error generating passport photo:", error);
      toast({ title: "Generation Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'jpg' | 'pdf') => {
    if (!resultUrl || !canvasRef.current) return;
    const filename = `passport_photo_${selectedPreset.name.split(' ')[0].toLowerCase()}.${format}`;

    if (format === 'jpg') {
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const pdf = new jsPDF({
        orientation: selectedPreset.widthMM > selectedPreset.heightMM ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [selectedPreset.widthMM, selectedPreset.heightMM]
      });
      pdf.addImage(resultUrl, 'JPEG', 0, 0, selectedPreset.widthMM, selectedPreset.heightMM);
      pdf.save(filename);
    }
     toast({ title: "Download Started", description: `Downloading ${filename}.` });
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    if(imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setResultUrl(null);
    setResultType(null);
    setIsLoading(false);
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
    }
    toast({ title: "Image Removed", description: "Upload a new image." });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upload Photo</CardTitle>
        </CardHeader>
        <CardContent>
          {imagePreview && imageFile ? (
            <div className="space-y-4 text-center">
              <div className="relative inline-block w-48 h-auto mx-auto border rounded-md overflow-hidden">
                 <Image src={imagePreview} alt="Uploaded photo preview" width={192} height={192 * (imageFile?.type.includes('png') ? 1 : (1/1))} objectFit="contain" />
              </div>
              <p className="text-sm text-muted-foreground">{imageFile.name}</p>
               <Button variant="outline" size="sm" onClick={handleRemoveImage}>
                    <XCircle className="mr-2 h-4 w-4" /> Remove Image
                </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-md cursor-pointer text-center hover:border-primary transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'}`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              {isDragActive ? <p className="text-primary">Drop photo here...</p> : <p>Drag 'n' drop, or click to select</p>}
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP. Max 5MB.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {imageFile && (
        <Card>
          <CardHeader><CardTitle className="font-headline text-xl">Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="countryPreset">Country Size Preset</Label>
              <Select
                value={selectedPreset.name}
                onValueChange={(val) => setSelectedPreset(countryPresets.find(p => p.name === val)!)}
              >
                <SelectTrigger id="countryPreset"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {countryPresets.map(p => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.name} ({p.widthMM}mm x {p.heightMM}mm
                      {p.widthInch && p.heightInch ? ` / ${p.widthInch}in x ${p.heightInch}in` : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Background Color</Label>
              <RadioGroup
                defaultValue={backgroundColor}
                onValueChange={(val: 'white' | 'blue') => setBackgroundColor(val)}
                className="flex space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="bg-white" />
                  <Label htmlFor="bg-white">White</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blue" id="bg-blue" />
                  <Label htmlFor="bg-blue">Light Blue</Label>
                </div>
              </RadioGroup>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Generate Passport Photo
            </Button>
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden"></canvas> {/* Hidden canvas for processing */}

      {resultUrl && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader><CardTitle className="font-headline text-xl">Generated Photo</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="inline-block border rounded-md shadow-md overflow-hidden">
              <Image src={resultUrl} alt="Generated passport photo" width={mmToPixels(selectedPreset.widthMM, 72)} height={mmToPixels(selectedPreset.heightMM, 72)} />
            </div>
             <p className="text-xs text-muted-foreground">Dimensions: {selectedPreset.widthMM}mm x {selectedPreset.heightMM}mm at 300 DPI</p>
            <div className="flex justify-center space-x-2">
              <Button onClick={() => handleDownload('jpg')} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download JPG
              </Button>
              <Button onClick={() => handleDownload('pdf')} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
