
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/document-converter-client';
import { FileText, FileSpreadsheet, FilePresentation, FileCode, FileIcon } from 'lucide-react'; // FileCode can represent DOCX

const conversionOptions = [
  {
    label: "PDF to Word (.docx)",
    value: "pdf-to-docx",
    sourceFormat: "pdf",
    targetFormat: "docx",
    accept: { 'application/pdf': ['.pdf'] },
    sourceIcon: FileText,
    targetIcon: FileCode, // Using FileCode for DOCX, replace if a better one exists
  },
  {
    label: "Word (.docx) to PDF",
    value: "docx-to-pdf",
    sourceFormat: "docx",
    targetFormat: "pdf",
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    sourceIcon: FileCode,
    targetIcon: FileText,
  }
];

export default function PdfWordConverterPage() {
  const tool = getToolById('pdf-word-converter');

  if (!tool) {
    return <div>Tool not found: pdf-word-converter</div>;
  }

  const instructions = [
    "Select the conversion direction (e.g., PDF to Word or Word to PDF).",
    `Upload your file (accepted types: ${conversionOptions.map(opt => Object.values(opt.accept).flat().join('/')).join(', ')}).`,
    "Click the 'Convert File' button.",
    "The system will simulate uploading and processing with a (hypothetical) backend Firebase Function.",
    "Once complete, a download link for the (placeholder) converted file will appear.",
    "Note: Actual conversion requires backend implementation."
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
