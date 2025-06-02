
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PasswordGeneratorClient } from './password-generator-client';
import { KeyRound } from 'lucide-react';

export default function PasswordGeneratorPage() {
  const tool = getToolById('password-generator');

  if (!tool) {
    return <div>Tool not found: password-generator</div>;
  }

  const instructions = [
    "Set the desired password length (8-64 characters).",
    "Choose character sets to include (uppercase, lowercase, numbers, symbols).",
    "Optionally, exclude similar characters or generate pronounceable passwords.",
    "Click 'Generate Password(s)'.",
    "Copy the generated password or view multiple options.",
    "Password strength is visually indicated (conceptual).",
    "Pattern input and local saving are conceptual features."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || KeyRound}
      instructions={instructions}
    >
      <PasswordGeneratorClient />
    </ToolPageTemplate>
  );
}
