
'use server';
/**
 * @fileOverview This file defines a Genkit flow to process a financial PDF document
 * and extract its content into a structured JSON format. It uses a hybrid approach:
 * 1. A reliable library (`pdf-parse`) extracts raw text and page count.
 * 2. An AI model structures this text, using the original PDF for visual context (e.g., for tables).
 *
 * - processPdf - A function that handles the PDF processing and JSON conversion.
 * - ProcessPdfInput - The input type for the processPdf function.
 * - ProcessPdfOutput - The return type for the processPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


/**
 * Extracts a JSON object from a string that might contain other text.
 * @param text The string to search within.
 * @returns The extracted JSON object as a string, or null if not found.
 */
function extractJsonObject(text: string): string | null {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1);
    }
    return null;
}


// Schemas for the structured data, mirroring the TypeScript interfaces in the application.
const TableSchema = z.object({
  id: z.string().describe('A unique identifier for the table (e.g., "table_1").'),
  title: z.string().describe('The title or caption of the table.'),
  headers: z.array(z.string()).describe('The column headers of the table.'),
  rows: z.array(z.array(z.string())).describe('The rows of the table, where each row is an array of strings.'),
  page: z.number().describe('The page number where the table was found.'),
});

const FinancialDataSchema = z.object({
  id: z.string().describe('A unique identifier for the financial data point (e.g., "financial_1").'),
  type: z.enum(['revenue', 'expense', 'balance', 'ratio', 'other']).describe('The type of financial data.'),
  label: z.string().describe('The label for the financial data (e.g., "Total Revenue").'),
  value: z.number().describe('The numerical value of the data point.'),
  currency: z.string().describe('The currency of the value (e.g., "USD", "%", "ratio").'),
  period: z.string().describe('The time period this data corresponds to (e.g., "2023", "Q4 2023").'),
  page: z.number().describe('The page number where the data was found.'),
});

const SectionSchema = z.object({
  id: z.string().describe('A unique identifier for the section (e.g., "section_1").'),
  title: z.string().describe('The title of the section (e.g., "Executive Summary").'),
  content: z.string().describe('A summary or the full text content of the section.'),
  page: z.number().describe('The page number where the section begins.'),
  type: z.enum(['header', 'paragraph', 'list', 'other']).describe('The type of content in the section.'),
});

const PageContentSchema = z.object({
  pageNumber: z.number().describe('The page number.'),
  text: z.string().describe('The full text content of the page.'),
  wordCount: z.number().describe('The estimated number of words on the page.'),
  hasTable: z.boolean().describe('Whether the page contains any tables.'),
  hasFinancialData: z.boolean().describe('Whether the page contains structured financial data points.'),
  confidence: z.number().min(0).max(1).describe('The confidence score for the extraction on this page (0 to 1).'),
});

const ExtractedContentSchema = z.object({
    text: z.string().describe("The full, verbatim text content from the entire document. This should not be a summary."),
    tables: z.array(TableSchema).describe("An array of all tables extracted from the document."),
    financialData: z.array(FinancialDataSchema).describe("An array of all structured financial data points."),
    sections: z.array(SectionSchema).describe("An array of identified document sections."),
    pageBreakdown: z.array(PageContentSchema).describe("A page-by-page breakdown of the content."),
});

const ExtractedMetadataSchema = z.object({
    title: z.string().describe("The document title, derived from the filename."),
    author: z.string().optional().describe("The author of the document, if available in the PDF metadata."),
    creator: z.string().optional().describe("The tool used to create the PDF, if available in the PDF metadata."),
    pages: z.number().describe("The total number of pages in the document. This should be the same as pagesProcessed."),
    actualPagesDetected: z.number().describe("The total number of pages you were able to detect by analyzing the document."),
    pagesProcessed: z.number().describe("The total number of pages you successfully processed. Your goal is for this to equal actualPagesDetected."),
    fileSize: z.number().describe("The size of the file in bytes."),
    extractedAt: z.string().datetime().describe("The ISO 8601 timestamp of when the extraction was performed."),
    processingTime: z.number().describe("The time taken for processing in milliseconds."),
    documentType: z.string().describe("The inferred type of financial document (e.g., 'Annual Report', '10-K', 'Quarterly Earnings')."),
    confidence: z.number().min(0).max(1).describe("Overall confidence score for the entire extraction (0 to 1)."),
    pageCountMethod: z.string().default("Library Extraction").describe("The method used to count pages."),
});

const ProcessPdfModelOutputSchema = z.object({
    metadata: ExtractedMetadataSchema,
    content: ExtractedContentSchema,
});


const ProcessPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file represented as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  fileName: z.string().describe("The original name of the file."),
  fileSize: z.number().describe("The size of the file in bytes."),
});
export type ProcessPdfInput = z.infer<typeof ProcessPdfInputSchema>;

// This is the input schema for the AI prompt, which includes pre-extracted text.
const ProcessPdfPromptInputSchema = ProcessPdfInputSchema.extend({
    extractedText: z.string().describe("The reliably extracted raw text from the PDF."),
    numPages: z.number().describe("The reliably extracted page count from the PDF.")
});

const ProcessPdfOutputSchema = z.object({
  jsonOutput: z
    .string()
    .describe(
      `A JSON string representing the full, structured content of the document.`
    ),
});
export type ProcessPdfOutput = z.infer<typeof ProcessPdfOutputSchema>;

export async function processPdf(input: ProcessPdfInput): Promise<ProcessPdfOutput> {
  return processPdfFlow(input);
}

const processPdfPrompt = ai.definePrompt({
  name: 'processPdfPrompt',
  input: {schema: ProcessPdfPromptInputSchema},
  output: {schema: ProcessPdfModelOutputSchema},
  prompt: `You are a world-class financial document analysis AI. Your task is to analyze the provided text and convert its content into a meticulously structured JSON format, using the accompanying PDF file for visual context.

**Primary Data Sources:**
- **Extracted Text:** You have been provided with the full, reliably extracted text of the document. This is your primary source of truth for all content.
- **Page Count:** You have been given the authoritative page count.
- **PDF Document for Visual Reference:** Use the provided PDF document **only** for visual context to understand layout, identify tables, group content into sections, and determine which page the text belongs to.

**CRITICAL Instructions:**
1.  **Trust the Extracted Text:** Do not perform OCR. The \`extractedText\` input is complete and accurate. Your job is to structure it. The 'content.text' field in your output JSON MUST be the verbatim \`extractedText\` you were given.
2.  **Adhere to Page Count:** The \`numPages\` input is the correct total number of pages. You MUST set \`metadata.actualPagesDetected\`, \`metadata.pages\`, and \`metadata.pagesProcessed\` to this value.
3.  **Synthesize Page Breakdown:** Create a 'pageBreakdown' array that accurately reflects the content of each page, a mapping sections of the \`extractedText\` to their corresponding page number from the visual PDF. The number of items in this array MUST match the \`numPages\` value.
4.  **Populate All Fields:** Fill out all fields in the provided JSON schema. Use your internal knowledge for \`extractedAt\` and \`processingTime\`. For \`confidence\`, provide an honest assessment of your ability to structure the provided text. Set \`pageCountMethod\` to "Library Extraction".
5.  **Strict Schema Adherence:** The final output must be a single, valid JSON object that strictly conforms to the output schema. Do not add extra commentary or markdown.

**Input Document Information:**
- **Filename:** {{{fileName}}}
- **File Size:** {{{fileSize}}} bytes
- **Authoritative Page Count:** {{{numPages}}}
- **Extracted Text Content:**
{{{extractedText}}}
- **PDF for Visual Reference:**
{{media url=pdfDataUri}}
`,
});

const processPdfFlow = ai.defineFlow(
  {
    name: 'processPdfFlow',
    inputSchema: ProcessPdfInputSchema,
    outputSchema: ProcessPdfOutputSchema,
  },
  async (input) => {
    // Dynamically import 'pdf-parse' to avoid server-side initialization issues in Next.js.
    const pdfParser = await import('pdf-parse');
    const pdf = pdfParser.default;
    const startTime = Date.now();
    
    // Step 1: Decode Data URI and extract text using pdf-parse library
    const base64Data = input.pdfDataUri.split(',')[1];
    if (!base64Data) {
        throw new Error("Invalid PDF Data URI provided.");
    }
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    const pdfData = await pdf(pdfBuffer);
    
    // Step 2: Call the AI model with the extracted text and the PDF for visual context.
    const response = await processPdfPrompt({
        ...input,
        extractedText: pdfData.text,
        numPages: pdfData.numpages,
    });
    const processingTime = Date.now() - startTime;
    
    const modelOutput = response.output;

    if (!modelOutput) {
      throw new Error('Model output was empty or invalid. The AI failed to generate a valid JSON structure.');
    }

    // Override AI-generated values with our more reliable data.
    modelOutput.metadata.processingTime = processingTime;
    modelOutput.metadata.pages = pdfData.numpages;
    modelOutput.metadata.actualPagesDetected = pdfData.numpages;
    modelOutput.content.text = pdfData.text; // Ensure the verbatim text is used.
    
    // Final verification step
    if (modelOutput.metadata.actualPagesDetected !== modelOutput.metadata.pagesProcessed) {
        console.warn(`Page count mismatch! Library found ${modelOutput.metadata.actualPagesDetected} pages, but AI processed ${modelOutput.metadata.pagesProcessed}.`);
        // We trust the library's count more.
        modelOutput.metadata.pagesProcessed = modelOutput.metadata.actualPagesDetected;
    }

    return {
      jsonOutput: JSON.stringify(modelOutput, null, 2),
    };
  }
);
