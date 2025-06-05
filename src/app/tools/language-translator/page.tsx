
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { LanguageTranslatorClient } from './language-translator-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('language-translator');
  if (!tool) {
    return {
      title: 'Tool Not Found | UniToolBox',
      description: 'The requested tool could not be found.',
    };
  }
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
  };
}

export default function LanguageTranslatorPage() {
  const tool = getToolById('language-translator');

  if (!tool) {
    return <div>Tool not found</div>;
  }
  
  const instructions = [
    "Enter the text you wish to translate into the input field.",
    "Select the source language (the language of your input text).",
    "Select the target language (the language you want to translate to).",
    "Click the 'Translate Text' button.",
    "The AI-powered translation will appear in the output area."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName}
      whatItDoes={tool.whatItDoes}
      benefits={tool.benefits}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <LanguageTranslatorClient />
    </ToolPageTemplate>
  );
}

    