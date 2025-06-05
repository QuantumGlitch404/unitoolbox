
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PasswordGeneratorClient } from './password-generator-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('password-generator');
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

export default function PasswordGeneratorPage() {
  const tool = getToolById('password-generator');

  if (!tool) {
    return <div>Tool not found: password-generator</div>;
  }

  const instructions = [
    "Adjust the 'Password Length' slider (8-64 characters).",
    "Select character sets to include: 'Uppercase (A-Z)', 'Lowercase (a-z)', 'Numbers (0-9)', and 'Symbols (!@#...)'.",
    "Optionally, check 'Exclude Similar' to avoid ambiguous characters like 'I', 'l', '1', 'O', '0'.",
    "Check 'Pronounceable' to generate passwords that alternate consonants and vowels (may simplify complexity if other sets are sparse).",
    "Set the 'Number to Generate' (1-10).",
    "Passwords are generated automatically as you change options, or click 'Regenerate Password(s)'.",
    "Copy any generated password using the copy icon. The strength of the first password is shown on the meter.",
    "The last batch of generated passwords is saved in your browser's local storage for the current session and can be viewed by clicking 'Show Last Saved Batch'.",
    "The 'Password Pattern' input is for future advanced customization; current generation primarily relies on the checkboxes and length."
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
      <PasswordGeneratorClient />
    </ToolPageTemplate>
  );
}

    