
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Added this import
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Edit3 as Edit3Icon, Image as ImageIconLucide } from 'lucide-react';

const handwritingFonts = [
  { name: 'Kalam', style: "'Kalam', cursive" },
  { name: 'Dancing Script', style: "'Dancing Script', cursive" },
  { name: 'Arial (Standard)', style: "Arial, sans-serif" }, // Fallback/comparison
];

const formSchema = z.object({
  text: z.string().min(1, "Text content cannot be empty.").max(2000, "Text is too long, max 2000 characters."),
  fontFamily: z.string().default(handwritingFonts[0].style),
  fontSize: z.coerce.number().min(12).max(72).default(24),
  fontColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").default("#333333"),
  canvasWidth: z.coerce.number().min(300).max(2000).default(800),
  canvasHeight: z.coerce.number().min(200).max(1500).default(600),
});

type TextToHandwritingFormData = z.infer<typeof formSchema>;

export function TextToHandwritingClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<TextToHandwritingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "Hello, world! This is a sample handwriting text.",
      fontFamily: handwritingFonts[0].style,
      fontSize: 24,
      fontColor: "#333333",
      canvasWidth: 800,
      canvasHeight: 600,
    },
  });

  const { watch } = form;
  const text = watch("text");
  const fontFamily = watch("fontFamily");
  const fontSize = watch("fontSize");
  const fontColor = watch("fontColor");
  const canvasWidth = watch("canvasWidth");
  const canvasHeight = watch("canvasHeight");
  
  // Debounced update for canvas preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#FFFFFF'; // White background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.textBaseline = 'top';

    // Draw text with line breaks
    const lines = text.split('\\n');
    const lineHeight = fontSize * 1.4; // Adjust line height factor as needed
    const padding = 20;
    let currentY = padding;

    for (const line of lines) {
        const words = line.split(' ');
        let currentLine = '';
        for(const word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > canvas.width - 2 * padding && currentLine !== '') {
                ctx.fillText(currentLine, padding, currentY);
                currentLine = word + ' ';
                currentY += lineHeight;
            } else {
                currentLine = testLine;
            }
            if (currentY + lineHeight > canvas.height - padding) break; // Stop if out of bounds
        }
        ctx.fillText(currentLine, padding, currentY);
        currentY += lineHeight;
        if (currentY > canvas.height - padding) break; // Stop if out of bounds
    }
    
  }, [text, fontFamily, fontSize, fontColor, canvasWidth, canvasHeight]);


  const onSubmit: SubmitHandler<TextToHandwritingFormData> = async (data) => {
    setIsLoading(true);
    setImageUrl(null);

    if (!canvasRef.current) {
      toast({ title: "Error", description: "Canvas not available.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setImageUrl(dataUrl);
      toast({ title: "Image Generated!", description: "Handwriting image is ready for download." });
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({ title: "Error", description: error.message || "Failed to generate image.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Text to Convert</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your text here... Use \n for new lines."
                    className="min-h-[150px] resize-y text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {handwritingFonts.map(font => (
                        <SelectItem key={font.style} value={font.style} style={{fontFamily: font.style}}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem><FormLabel>Font Size (px)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField
              control={form.control}
              name="fontColor"
              render={({ field }) => (
                <FormItem><FormLabel>Font Color</FormLabel><FormControl><Input type="color" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
              )} />
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="canvasWidth"
              render={({ field }) => (
                <FormItem><FormLabel>Image Width (px)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
             <FormField
              control={form.control}
              name="canvasHeight"
              render={({ field }) => (
                <FormItem><FormLabel>Image Height (px)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
           </div>

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIconLucide className="mr-2 h-4 w-4" />}
            Generate Handwriting Image
          </Button>
        </form>
      </Form>
      
      <Card>
        <CardHeader><CardTitle className="font-headline text-xl">Live Preview</CardTitle></CardHeader>
        <CardContent>
            <canvas 
                ref={canvasRef} 
                width={form.getValues("canvasWidth")} 
                height={form.getValues("canvasHeight")} 
                className="border rounded-md shadow-inner bg-white"
            />
        </CardContent>
      </Card>

      {imageUrl && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader><CardTitle className="font-headline text-xl">Download Image</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-center">
            <Image src={imageUrl} alt="Generated handwriting" width={form.getValues("canvasWidth")/2} height={form.getValues("canvasHeight")/2} className="mx-auto border rounded-md" />
            <Button asChild className="w-full sm:w-auto">
              <a href={imageUrl} download="handwriting.png">
                <Download className="mr-2 h-4 w-4" /> Download PNG
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
