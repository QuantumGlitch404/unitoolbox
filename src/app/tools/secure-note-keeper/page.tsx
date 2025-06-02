
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { SecureNoteKeeperClient } from './secure-note-keeper-client';
import { LockKeyhole } from 'lucide-react';

export default function SecureNoteKeeperPage() {
  const tool = getToolById('secure-note-keeper');

  if (!tool) {
    return <div>Tool not found: secure-note-keeper</div>;
  }

  const instructions = [
    "Set a master password to (conceptually) encrypt your notes. Remember it!",
    "Create, edit, and save notes. Notes are stored locally in your browser.",
    "Organize notes with categories (conceptual).",
    "Search your notes by keyword.",
    "Encryption (AES-256), encrypted export/import, and secure deletion are conceptual features for this client-side demo.",
    "All operations are performed locally in your browser."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon || LockKeyhole}
      instructions={instructions}
    >
      <SecureNoteKeeperClient />
    </ToolPageTemplate>
  );
}
