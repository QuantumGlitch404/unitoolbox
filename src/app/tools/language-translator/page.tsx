import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { LanguageTranslatorClient } from './language-translator-client';
import { Languages } from 'lucide-react'; // Placeholder, tool data has icon

export default function LanguageTranslatorPage() {
  const tool = getToolById('language-translator');

  if (!tool) {
    return <div>Tool not found</div>;
  }
  
  const instructions = [
    "Enter the text you want to translate.",
    "Select the source language of your text.",
    "Select the target language for translation.",
    "Click 'Translate Text'. The translated text will appear below."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || Languages}
      instructions={instructions}
    >
      <LanguageTranslatorClient />
    </ToolPageTemplate>
  );
}
