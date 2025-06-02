
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { LanguageTranslatorClient } from './language-translator-client';
// Languages import not needed here for default

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
      iconName={tool.iconName || 'Languages'}
      instructions={instructions}
    >
      <LanguageTranslatorClient />
    </ToolPageTemplate>
  );
}

    