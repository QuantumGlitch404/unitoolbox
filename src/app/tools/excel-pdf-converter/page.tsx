
import { ToolPageTemplate } from '@/components/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/document-converter-client';
// Icons are now handled by the client component via string names

const conversionOptions = [
  {
    label: "Excel (.xlsx) to PDF",
    value: "xlsx-to-pdf",
    sourceFormat: "xlsx",
    targetFormat: "pdf",
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    sourceIconName: "FileSpreadsheet",
    targetIconName: "FileText",
  },
  {
    label: "PDF to Excel (.xlsx)",
    value: "pdf-to-xlsx",
    sourceFormat: "pdf",
    targetFormat: "xlsx",
    accept: { 'application/pdf': ['.pdf'] },
    sourceIconName: "FileText",
    targetIconName: "FileSpreadsheet",
  }
];

export default function ExcelPdfConverterPage() {
  const tool = getToolById('excel-pdf-converter');

  if (!tool) {
    return <div>Tool not found: excel-pdf-converter</div>;
  }

  const instructions = [
    "Select the conversion direction (e.g., Excel to PDF or PDF to Excel).",
    `Upload your file.`,
    "Click the 'Convert File' button.",
    "The system will simulate uploading and processing.",
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
        toolName="excel-pdf-converter"
        conversionOptions={conversionOptions}
        defaultConversionValue="xlsx-to-pdf"
      />
    </ToolPageTemplate>
  );
}
