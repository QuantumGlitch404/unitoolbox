"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { summarizeEssay, type SummarizeEssayInput } from '@/ai/flows/essay-summarizer';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  essay: z.string().min(50, "Essay must be at least 50 characters long."),
});

type EssaySummarizerFormData = z.infer<typeof formSchema>;

export function EssaySummarizerClient() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EssaySummarizerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      essay: "",
    },
  });

  const onSubmit: SubmitHandler<EssaySummarizerFormData> = async (data) => {
    setIsLoading(true);
    setSummary(null);
    try {
      const result = await summarizeEssay({ essay: data.essay });
      setSummary(result.summary);
      toast({
        title: "Success!",
        description: "Essay summarized successfully.",
      });
    } catch (error) {
      console.error("Error summarizing essay:", error);
      setSummary("Failed to summarize the essay. Please try again.");
      toast({
        title: "Error",
        description: "Failed to summarize essay. Please try again later.",
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
            name="essay"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Essay Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste your long essay here..."
                    className="min-h-[200px] resize-y text-base"
                    {...field}
                    aria-label="Essay input area"
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
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Summarize Essay
          </Button>
        </form>
      </Form>

      {summary && (
        <Card className="mt-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Summary</CardTitle>
            <CardDescription>This is the summarized version of your essay.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
