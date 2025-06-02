
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Tool } from '@/lib/tools';
import { ArrowRight, Sparkles, HelpCircle } from 'lucide-react'; // Added HelpCircle for fallback
import * as LucideIcons from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const IconComponent = (LucideIcons as any)[tool.iconName] || HelpCircle;

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconComponent className="w-7 h-7 text-accent flex-shrink-0" />
          <CardTitle className="font-headline text-md leading-tight">{tool.title}</CardTitle>
          {tool.aiPowered && (
            <Sparkles className="w-5 h-5 text-primary ml-auto" title="AI Powered" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm line-clamp-3">
          {clientMounted ? tool.description : '\u00A0'}
        </CardDescription>
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

    