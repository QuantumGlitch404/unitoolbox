
import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react'; // Added HelpCircle for fallback
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';

interface ToolPageTemplateProps {
  title: string;
  description: string;
  iconName?: string; // Changed from icon: React.ElementType
  children: ReactNode;
  instructions?: string[];
  showBackButton?: boolean;
}

export function ToolPageTemplate({
  title,
  description,
  iconName,
  children,
  instructions,
  showBackButton = true,
}: ToolPageTemplateProps) {
  const IconComponent = iconName ? (LucideIcons as any)[iconName] || HelpCircle : HelpCircle;
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {showBackButton && (
        <Button variant="outline" asChild className="mb-6">
          <Link href="/tools">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Tools
          </Link>
        </Button>
      )}
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <IconComponent className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-3xl">{title}</CardTitle>
          </div>
          <CardDescription className="text-md">{description}</CardDescription>
        </CardHeader>
        <Separator className="my-0" />
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {children}
            </div>
            {(instructions && instructions.length > 0) && (
              <aside className="md:col-span-1 space-y-4 p-4 bg-secondary/30 rounded-lg border">
                <h3 className="font-headline text-lg font-semibold">How to use:</h3>
                <ul className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                  {instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    