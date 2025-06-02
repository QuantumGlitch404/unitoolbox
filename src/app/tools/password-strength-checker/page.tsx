
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
    "Password strength is evaluated in real-time.",
    "A color-coded bar indicates strength (red, orange, green).",
    "Checks include length, character variety, and basic patterns.",
    "Suggestions for improvement will appear for weak passwords.",
    "Dictionary checks and crack time estimation are conceptual features.",
    "Batch checking and full accessibility are target features."
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
