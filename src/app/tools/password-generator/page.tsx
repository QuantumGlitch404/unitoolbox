
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PasswordGeneratorClient } from './password-generator-client';
// KeyRound import not needed for default

export default function PasswordGeneratorPage() {
  const tool = getToolById('password-generator');

  if (!tool) {
    return <div>Tool not found: password-generator</div>;
  }

  const instructions = [
    "Set the desired password length (8-64 characters).",
    "Choose character sets to include: uppercase, lowercase, numbers, symbols.",
    "Optionally, exclude similar characters (e.g., I, l, 1, O, 0) for better readability.",
    "Opt for pronounceable passwords (alternating consonants/vowels).",
    "Specify the number of passwords to generate (1-10).",
    "Click 'Generate Password(s)'.",
    "Copy any generated password. View its strength on the meter.",
    "The last generated batch is saved in your browser for this session.",
    "Note: The 'Password Pattern' input is for future advanced customization and does not currently parse specific patterns like LLLNNs.",
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'KeyRound'}
      instructions={instructions}
    >
      <PasswordGeneratorClient />
    </ToolPageTemplate>
  );
}

    