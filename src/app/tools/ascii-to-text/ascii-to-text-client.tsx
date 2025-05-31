
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Type as TypeIcon, Wand2 } from 'lucide-react';

const formSchema = z.object({
  asciiInput: z.string().min(1, "ASCII input cannot be empty."),
});

type AsciiToTextFormData = z.infer<typeof formSchema>;

// Placeholder conversion logic
const convertAsciiToText = (ascii: string): string => {
  try {
    // This is a very basic attempt and might not cover all ASCII or encoding scenarios
    // For a real tool, more robust decoding would be needed.
    if (/^(\d+\s*)+$/.test(ascii)) { // Looks like a sequence of numbers (char codes)
        return ascii.split(/\s+/).filter(Boolean).map(code => String.fromCharCode(parseInt(code))).join('');
    }
    // Add other heuristic checks or allow user to specify encoding if needed.
    // For now, just return as is if not obviously char codes.
    return `(Assuming direct text or simple ASCII) Decoded: ${ascii}`;
  } catch (e) {
    return "Error: Could not decode ASCII. Ensure it's valid.";
  }
};


export function AsciiToTextClient() {
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AsciiToTextFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asciiInput: "",
    },
  });

  const onSubmit: SubmitHandler<AsciiToTextFormData> = async (data) => {
    setIsLoading(true);
    setDecodedText(null);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    try {
      const result = convertAsciiToText(data.asciiInput);
      setDecodedText(result);
      toast({
        title: "Conversion Successful!",
        description: "ASCII has been converted to text.",
      });
    } catch (error: any) {
      setDecodedText(`Error: ${error.message}`);
      toast({
        title: "Conversion Error",
        description: error.message || "Failed to convert ASCII to text.",
        variant: "destructive",
      });
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
            name="asciiInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">ASCII Input</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter ASCII encoded text here (e.g., 72 101 108 108 111)"
                    className="min-h-[150px] resize-y text-base font-mono"
                    {...field}
                    aria-label="ASCII input area"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TypeIcon className="mr-2 h-4 w-4" />
            )}
            Convert to Text
          </Button>
        </form>
      </Form>

      {decodedText && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Decoded Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={decodedText}
              readOnly
              className="min-h-[150px] resize-y text-base font-mono bg-background/50"
              aria-label="Decoded text output"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
