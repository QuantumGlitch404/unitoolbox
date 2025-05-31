
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/document-converter-client';

const conversionOptions = [
  {
    label: "PDF to Word (.docx)",
    value: "pdf-to-docx",
    sourceFormat: "pdf",
    targetFormat: "docx",
    accept: { 'application/pdf': ['.pdf'] },
    sourceIconName: "FileText",
    targetIconName: "FileCode",
  },
  {
    label: "Word (.docx) to PDF",
    value: "docx-to-pdf",
    sourceFormat: "docx",
    targetFormat: "pdf",
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    sourceIconName: "FileCode",
    targetIconName: "FileText",
  }
];

export default function PdfWordConverterPage() {
  const tool = getToolById('pdf-word-converter');

  if (!tool) {
    return <div>Tool not found: pdf-word-converter</div>;
  }

  const instructions = [
    "Select the conversion direction (e.g., PDF to Word or Word to PDF).",
    "Upload your file (PDF or DOCX). Max 25MB for client-side processing.",
    "Click the 'Convert File' button. The conversion happens directly in your browser.",
    "Once complete, a download link for the converted file will appear.",
    "PDF to Word: Extracts text and creates a .docx file with basic paragraph structure. Complex formatting from the PDF is generally not preserved.",
    "Word to PDF: Converts your .docx to .pdf. Formatting preservation depends on document complexity; uses HTML rendering to an image for the PDF."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      icon={tool.icon}
      instructions={instructions}
    >
      <DocumentConverterClient
        toolName="pdf-word-converter"
        conversionOptions={conversionOptions}
        defaultConversionValue="pdf-to-docx"
      />
    </ToolPageTemplate>
  );
}
