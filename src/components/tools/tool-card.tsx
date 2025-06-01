import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Tool } from '@/lib/tools';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg overflow-hidden">
      <CardHeader> {/* Defaults to p-6 */}
        <div className="flex items-center gap-3">
          <tool.icon className="w-7 h-7 text-accent flex-shrink-0" />
          {/* Reduced title font size from text-lg to text-md */}
          <CardTitle className="font-headline text-md leading-tight">{tool.title}</CardTitle>
          {tool.aiPowered && (
            <Sparkles className="w-5 h-5 text-primary ml-auto" title="AI Powered" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow"> {/* Defaults to p-6 pt-0 */}
        <CardDescription className="text-sm line-clamp-3">{tool.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={tool.href}>
            Open Tool <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
