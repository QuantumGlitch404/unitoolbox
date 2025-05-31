"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { translate, type TranslateInput } from '@/ai/flows/language-translator';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Languages as LanguagesIcon } from 'lucide-react';

// A simplified list of common languages for the dropdown.
// In a real app, this would be more comprehensive.
const commonLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
];

const formSchema = z.object({
  text: z.string().min(1, "Text to translate cannot be empty."),
  sourceLanguage: z.string().min(2, "Please select a source language."),
  targetLanguage: z.string().min(2, "Please select a target language."),
}).refine(data => data.sourceLanguage !== data.targetLanguage, {
  message: "Source and target languages must be different.",
  path: ["targetLanguage"], // Attach error to targetLanguage field
});

type LanguageTranslatorFormData = z.infer<typeof formSchema>;

export function LanguageTranslatorClient() {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LanguageTranslatorFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      sourceLanguage: "en", // Default to English
      targetLanguage: "es", // Default to Spanish
    },
  });

  const onSubmit: SubmitHandler<LanguageTranslatorFormData> = async (data) => {
    setIsLoading(true);
    setTranslatedText(null);
    try {
      const result = await translate(data);
      setTranslatedText(result.translatedText);
       toast({
        title: "Success!",
        description: "Text translated successfully.",
      });
    } catch (error) {
      console.error("Error translating text:", error);
      setTranslatedText("Failed to translate the text. Please try again.");
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again later.",
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
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Text to Translate</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter text here..."
                    className="min-h-[150px] resize-y text-base"
                    {...field}
                    aria-label="Text input for translation"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="sourceLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Source Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger aria-label="Source language select">
                        <SelectValue placeholder="Select source language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commonLanguages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
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
              name="targetLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Target Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger aria-label="Target language select">
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commonLanguages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LanguagesIcon className="mr-2 h-4 w-4" />
            )}
            Translate Text
          </Button>
        </form>
      </Form>

      {translatedText && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Translated Text</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{translatedText}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
