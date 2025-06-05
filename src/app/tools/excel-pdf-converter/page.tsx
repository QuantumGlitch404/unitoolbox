
import { ToolPageTemplate } from '@/components/tools/tool-page-template';
import { getToolById } from '@/lib/tools';
import { DocumentConverterClient } from '@/components/tools/document-converter-client';
import { AdPlaceholder } from '@/components/ads/ad-placeholder';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolById('excel-pdf-converter');
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
    "Select your desired conversion: 'Excel (.xlsx) to PDF' or 'PDF to Excel (.xlsx)'.",
    "Upload your file (XLSX or PDF, based on your choice). Max file size is 25MB for client-side processing.",
    "Click the 'Convert File' button. The conversion will be processed in your browser.",
    "Wait for the process to complete. Progress will be shown.",
    "A download link for your converted file will appear automatically once done.",
    "Note on Excel to PDF: Converts the first sheet of your .xlsx file into a PDF table, aiming to preserve tabular data layout.",
    "Note on PDF to Excel: Attempts to extract text-based table data from the PDF into an .xlsx file. The success and accuracy of table structure preservation vary significantly with PDF complexity and how the table was originally created in the PDF. Formatting is generally not preserved."
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
      <DocumentConverterClient
        toolName="excel-pdf-converter"
        conversionOptions={conversionOptions}
        defaultConversionValue="xlsx-to-pdf"
      />
    </ToolPageTemplate>
  );
}

    