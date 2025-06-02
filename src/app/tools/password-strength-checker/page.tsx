
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { PasswordStrengthCheckerClient } from './password-strength-checker-client';
import { ShieldCheck } from 'lucide-react';

export default function PasswordStrengthCheckerPage() {
  const tool = getToolById('password-strength-checker');

  if (!tool) {
    return <div>Tool not found: password-strength-checker</div>;
  }

  const instructions = [
    "Type or paste your password into the input field.",
    "Password strength is evaluated in real-time, shown by a color-coded bar.",
    "Checks include length, character variety (uppercase, lowercase, digits, symbols), common patterns, and a small list of very common passwords.",
    "Suggestions for improvement will appear for weaker passwords.",
    "A simplified 'Estimated Time to Crack' is displayed (note: this is a very rough client-side estimate).",
    "Use the 'Batch Check' area to analyze multiple passwords at once (one per line).",
    "Copy the strength summary for your password if needed."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || ShieldCheck}
      instructions={instructions}
    >
      <PasswordStrengthCheckerClient />
    </ToolPageTemplate>
  );
}

    