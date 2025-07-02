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
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ProcessPdfInput = z.infer<typeof ProcessPdfInputSchema>;

const ProcessPdfOutputSchema = z.object({
  jsonOutput: z
    .string()
    .describe(
      'The full content of the PDF, intelligently converted into a structured JSON format. This should include metadata, all text, and any tables found in the document.'
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
  prompt: `You are an AI expert specializing in document intelligence and data extraction. Your task is to meticulously analyze the provided PDF document and convert its entire content into a single, well-structured JSON object.

The JSON output should be comprehensive and intelligently organized. It should include:
1.  **metadata**: Basic information about the document (if discernible), such as title or subject.
2.  **content**: A structured representation of the text, broken down into sections or paragraphs.
3.  **tables**: An array of objects, where each object represents a table found in the document. Convert the tabular data into a JSON-friendly format (e.g., an array of row objects).

Preserve all information from the document. Do not summarize or omit any data. The goal is a complete and accurate conversion of the PDF's content into a structured JSON format that can be easily parsed and analyzed by other systems.

PDF Document for processing:
{{media url=pdfDataUri}}`,
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
