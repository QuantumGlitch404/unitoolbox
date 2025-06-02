
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { TextToHandwritingClient } from './text-to-handwriting-client';

export default function TextToHandwritingPage() {
  const tool = getToolById('text-to-handwriting');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  const instructions = [
    "Enter the text you want to convert into the text area.",
    "Select a handwriting-style font from the dropdown.",
    "Adjust font size and color if desired.",
    "Click the 'Generate Handwriting Image' button.",
    "The text will be rendered as an image, which you can then download."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'Edit3'}
      instructions={instructions}
    >
      <TextToHandwritingClient />
    </ToolPageTemplate>
  );
}

    