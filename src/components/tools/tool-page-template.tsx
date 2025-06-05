
import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Info, Lightbulb, Settings, ThumbsUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../ui/button';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ToolPageTemplateProps {
  title: string;
  description: string;
  iconName?: string;
  children: ReactNode;
  whatItDoes?: string;
  benefits?: string[];
  instructions?: string[];
  showBackButton?: boolean;
}

export function ToolPageTemplate({
  title,
  description,
  iconName,
  children,
  whatItDoes,
  benefits,
  instructions,
  showBackButton = true,
}: ToolPageTemplateProps) {
  const IconComponent = iconName ? (LucideIcons as any)[iconName] || HelpCircle : HelpCircle;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-5xl">
      {showBackButton && (
        <Button variant="outline" asChild className="mb-4 sm:mb-6">
          <Link href="/tools">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Tools
          </Link>
        </Button>
      )}
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-primary flex-shrink-0" />
            <CardTitle className="font-headline text-2xl sm:text-3xl md:text-4xl">{title}</CardTitle>
          </div>
          <CardDescription className="text-md sm:text-lg">{description}</CardDescription>
        </CardHeader>
        <Separator className="my-0" />
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="md:col-span-2 space-y-6">
              {whatItDoes && (
                <section aria-labelledby="what-it-does">
                  <h2 id="what-it-does" className="font-headline text-xl sm:text-2xl font-semibold mb-3 flex items-center"><Info className="mr-2 h-5 w-5 text-accent" />What this tool does:</h2>
                  <p className="text-muted-foreground leading-relaxed">{whatItDoes}</p>
                </section>
              )}

              {benefits && benefits.length > 0 && (
                 <section aria-labelledby="key-benefits">
                  <h2 id="key-benefits" className="font-headline text-xl sm:text-2xl font-semibold mb-3 flex items-center"><ThumbsUp className="mr-2 h-5 w-5 text-accent" />Key Benefits:</h2>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground leading-relaxed">
                    {benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </section>
              )}
              
              <Separator className="my-4 md:my-6"/>

              {/* Main tool UI passed as children */}
              <section aria-label={`${title} Tool Interface`}>
                {children}
              </section>
              
              <section className="mt-8 py-6" aria-label="Advertisement Area">
                <AdPlaceholder type="mediumRectangle" className="mx-auto" />
              </section>
            </div>
            
            {(instructions && instructions.length > 0) && (
              <aside className="md:col-span-1 space-y-4 p-4 bg-muted/30 rounded-lg border self-start">
                <h3 className="font-headline text-lg sm:text-xl font-semibold flex items-center"><Settings className="mr-2 h-5 w-5 text-accent"/>How to use:</h3>
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

    