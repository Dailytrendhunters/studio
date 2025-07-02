'use server';
/**
 * @fileOverview This file defines a Genkit flow to process a PDF document
 * and extract its content into a structured JSON format.
 *
 * - processPdf - A function that handles the PDF processing and JSON conversion.
 * - ProcessPdfInput - The input type for the processPdf function.
 * - ProcessPdfOutput - The return type for the processPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessPdfInputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "The gs:// URI of a PDF file in Google Cloud Storage. Expected format: 'gs://<bucket-name>/<file-path>'."
    ),
});
export type ProcessPdfInput = z.infer<typeof ProcessPdfInputSchema>;

const ProcessPdfOutputSchema = z.object({
  totalPages: z.number().describe('The total number of pages in the PDF document.'),
  pagesProcessed: z.number().describe('The number of pages successfully processed from the document.'),
  jsonOutput: z
    .string()
    .describe(
      'The full content of the PDF, intelligently converted into a structured JSON format. This should include metadata, all text, and any tables found in the document. This output should only contain data extracted from the document, with no additional AI-generated content or summaries.'
    ),
});
export type ProcessPdfOutput = z.infer<typeof ProcessPdfOutputSchema>;

export async function processPdf(input: ProcessPdfInput): Promise<ProcessPdfOutput> {
  return processPdfFlow(input);
}

const processPdfPrompt = ai.definePrompt({
  name: 'processPdfPrompt',
  input: {schema: ProcessPdfInputSchema},
  output: {schema: ProcessPdfOutputSchema},
  prompt: `You are an AI expert specializing in document intelligence and data extraction. Your task is to meticulously analyze the provided PDF document, determine the total number of pages, and convert its entire content into a single, well-structured JSON object.

Your primary goal is accuracy and completeness. Do not add, invent, or hallucinate any information that is not explicitly present in the document. The output must be a faithful, structured representation of the source material.

In your response, you must provide:
1.  **totalPages**: The total number of pages in the PDF.
2.  **pagesProcessed**: The number of pages you were able to successfully process. This should match totalPages.
3.  **jsonOutput**: A string containing a JSON object with the full content of the PDF. This JSON should be intelligently organized with:
    - **metadata**: Basic information about the document (if discernible).
    - **content**: A structured representation of all text.
    - **tables**: All tables found in the document, converted into a JSON-friendly format.

Preserve all information. Do not summarize or omit any data.

PDF Document for processing:
{{media url=pdfUri}}`,
});

const processPdfFlow = ai.defineFlow(
  {
    name: 'processPdfFlow',
    inputSchema: ProcessPdfInputSchema,
    outputSchema: ProcessPdfOutputSchema,
  },
  async (input) => {
    const {output} = await processPdfPrompt(input);
    return output!;
  }
);
