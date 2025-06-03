
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/tools/document-converter-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';

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
    "Upload your file (XLSX or PDF). Max 25MB for client-side processing.",
    "Click the 'Convert File' button. The conversion happens directly in your browser.",
    "Once complete, a download link for the converted file will appear.",
    "PDF to Excel: Attempts to extract text-based table data into an .xlsx file. Success varies with PDF structure and complexity. Formatting is not preserved.",
    "Excel to PDF: Converts the first sheet of your .xlsx to .pdf, focusing on tabular data layout."
  ];

  return (
    <ToolPageTemplate
      title={tool.title}
      description={tool.description}
      iconName={tool.iconName || 'ArrowRightLeft'}
      instructions={instructions}
    >
      <AdPlaceholder type="banner" className="mb-6" />
      <DocumentConverterClient
        toolName="excel-pdf-converter"
        conversionOptions={conversionOptions}
        defaultConversionValue="xlsx-to-pdf"
      />
    </ToolPageTemplate>
  );
}

    