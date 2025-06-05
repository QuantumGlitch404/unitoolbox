
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PasswordStrengthCheckerClient } from './password-strength-checker-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('password-strength-checker');
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

export default function PasswordStrengthCheckerPage() {
  const tool = getToolById('password-strength-checker');

  if (!tool) {
    return <div>Tool not found: password-strength-checker</div>;
  }

  const instructions = [
    "Type or paste the password you want to analyze into the 'Password Input & Analysis' field.",
    "The tool will evaluate the password strength in real-time, indicated by a color-coded progress bar and a strength label (e.g., Very Weak, Strong).",
    "It checks for length, character variety (uppercase, lowercase, digits, symbols), common keyboard patterns, and a small list of very common passwords.",
    "Suggestions for improving the password's strength will appear below the meter if applicable.",
    "A simplified 'Estimated Time to Crack' is displayed for context (note: this is a very rough client-side estimate and not a guarantee).",
    "Use the 'Batch Password Checker' area to analyze multiple passwords: paste them one per line, then click 'Check Batch'. Results for each will be shown.",
    "You can copy a summary of the strength analysis for the single password using the 'Copy Summary' button."
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
      <PasswordStrengthCheckerClient />
    </ToolPageTemplate>
  );
}

    