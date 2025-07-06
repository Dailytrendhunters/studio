
'use server';
/**
 * @fileOverview This file defines a Genkit flow to process a financial PDF document
 * and extract its content into a structured JSON format that matches the application's UI components.
 * It includes an AI-powered repair mechanism for malformed JSON.
 *
 * - processPdf - A function that handles the PDF processing and JSON conversion.
 * - ProcessPdfInput - The input type for the processPdf function.
 * - ProcessPdfOutput - The return type for the processPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { repairJson } from './repair-json-flow';

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
    text: z.string().describe("The consolidated and summarized text from the entire document."),
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
    pageCountMethod: z.string().default("AI Model Analysis").describe("The method used to count pages."),
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


const SCHEMA_DESCRIPTION = `The JSON object must have 'metadata' and 'content' properties.
- 'metadata' must contain: title (string), fileSize (number), pages (number), actualPagesDetected (number), pagesProcessed (number), documentType (string), confidence (number from 0-1), extractedAt (ISO datetime string), processingTime (number), and pageCountMethod (string).
- 'content' must contain: text (string), tables (array of objects), financialData (array of objects), sections (array of objects), and pageBreakdown (array of objects).
- Each 'table' must have: id, title, headers (array of strings), rows (array of array of strings), and page (number).
- Each 'financialData' point must have: id, type ('revenue' | 'expense' | 'balance' | 'ratio' | 'other'), label, value (number), currency, period, and page (number).
- Each 'section' must have: id, title, content (string), page (number), and type ('header' | 'paragraph' | 'list' | 'other').
- Each 'pageBreakdown' item must have: pageNumber, text, wordCount, hasTable (boolean), hasFinancialData (boolean), and confidence (number from 0-1).
Ensure all required fields are present and data types are correct.`;


const processPdfPrompt = ai.definePrompt({
  name: 'processPdfPrompt',
  input: {schema: ProcessPdfInputSchema},
  output: {schema: ProcessPdfModelOutputSchema},
  prompt: `You are a world-class financial document analysis AI. Your task is to convert the provided financial PDF into a meticulously structured JSON format. You are capable of handling documents with thousands of pages.

**CRITICAL Instructions:**
1.  **Analyze Comprehensively & Count Pages:** Before any other processing, you MUST analyze the entire document to determine the exact total number of pages. This is the most critical step. Set the 'actualPagesDetected' field in the metadata to this number.
2.  **Process Every Single Page:** You MUST process every single page from start to finish. For each page, create a corresponding entry in the 'pageBreakdown' array.
3.  **Verify Processing:** The final number of items in the 'pageBreakdown' array MUST exactly match the 'actualPagesDetected' number. Set 'pagesProcessed' to this final count. Your goal is 100% coverage.
4.  **Extract Verbatim:** Extract text, tables, and figures as accurately as possible. Do not summarize unless creating content for a 'section' summary.
5.  **Populate All Fields:** Fill out all fields in the provided JSON schema. For metadata fields like \`processingTime\` and \`extractedAt\`, use your internal knowledge to provide accurate values. For \`confidence\`, provide an honest assessment of your extraction quality based on the document's clarity and your ability to process all pages.
6.  **Strict Schema Adherence:** The final output must be a single, valid JSON object that strictly conforms to the output schema. Do not add extra commentary or markdown.

**Input Document Information:**
-   **Filename:** {{{fileName}}}
-   **File Size:** {{{fileSize}}} bytes

**PDF Document for Processing:**
{{media url=pdfDataUri}}`,
});

const processPdfFlow = ai.defineFlow(
  {
    name: 'processPdfFlow',
    inputSchema: ProcessPdfInputSchema,
    outputSchema: ProcessPdfOutputSchema,
  },
  async (input) => {
    const response = await processPdfPrompt(input);
    
    let modelOutput = response.output;

    if (!modelOutput) {
        console.warn("Initial structured output failed. Attempting AI repair on raw text.");
        const rawText = response.text;
        
        if (!rawText) {
            throw new Error('The AI model returned no text output to repair.');
        }
        
        try {
            const repairedJsonString = await repairJson({ 
              brokenJson: rawText,
              schemaDescription: SCHEMA_DESCRIPTION
            });
            
            const potentialRepairedJson = extractJsonObject(repairedJsonString);
            if (!potentialRepairedJson) {
                throw new Error("AI repair returned a response, but no JSON object could be found within it.");
            }
            const parsedRepaired = JSON.parse(potentialRepairedJson);
            modelOutput = ProcessPdfModelOutputSchema.parse(parsedRepaired);
            console.log("AI repair successful!");
        } catch (repairError) {
            console.error("AI repair also failed.", repairError);
            if (repairError instanceof Error) {
                throw new Error(`PDF processing failed even after AI repair. Details: ${repairError.message}`);
            }
            throw new Error('PDF processing failed after an unsuccessful AI repair attempt.');
        }
    }

    if (!modelOutput) {
      throw new Error('Model output was empty or invalid after all processing attempts.');
    }

    // Final verification step
    if (modelOutput.metadata.actualPagesDetected !== modelOutput.metadata.pagesProcessed) {
        console.warn(`Page count mismatch detected by flow: ${modelOutput.metadata.actualPagesDetected} detected vs ${modelOutput.metadata.pagesProcessed} processed.`);
    }

    return {
      jsonOutput: JSON.stringify(modelOutput, null, 2),
    };
  }
);
