
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
      `A JSON string representing the structured content of the document. This JSON object must be optimized for AI analysis and preserve the document's logical hierarchy. It should capture subjects, chapters, sections, tables, and examples as described in the prompt.`
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
  prompt: `You are a highly advanced AI specializing in document intelligence for financial, scientific, and legal domains. Your primary task is to convert the provided PDF document into a meticulously structured, machine-readable JSON format that is optimized for AI analysis, retrieval, and content generation.

The output must preserve the document's logical hierarchy and semantic meaning. Do not summarize, interpret, or add any information not present in the source document. Every piece of text, including paragraphs, list items, and table content, must be captured.

First, determine the total number of pages in the document and ensure all pages are processed.

Then, generate a JSON string for the 'jsonOutput' field. This JSON string MUST adhere to the following detailed, mixed, and nested structure:

- **Root Object**:
  - \`subject\`: (string) The primary subject of the document (e.g., "Corporate Finance," "Quantum Mechanics," "Contract Law").
  - \`chapters\`: (array) An array of chapter objects.
    - **Chapter Object**:
      - \`id\`: (string) The chapter identifier (e.g., "Chapter 5").
      - \`title\`: (string) The full title of the chapter.
      - \`learning_outcomes\`: (array of strings) A list of verbatim learning outcomes or key takeaways from the chapter.
      - \`sections\`: (array) An array of section objects within the chapter.
        - **Section Object**:
          - \`id\`: (string) The section identifier (e.g., "5.2").
          - \`title\`: (string) The title of the section.
          - \`paragraphs\`: (array of strings) The complete, verbatim text of each paragraph in the section.
          - \`subsections\`: (array of objects, optional) For distinct parts like definitions, classifications, or legal/statutory references.
            - **Subsection Object**:
              - \`id\`: (string, optional) Identifier for the subsection.
              - \`title\`: (string) Title of the subsection (e.g., "Definition of Terms").
              - \`content\`: (array of strings) Full content of the subsection, with each paragraph as a separate string.
          - \`tables\`: (array of objects, optional) An array of all tables found *within this section*.
            - **Table Object**:
              - \`id\`: (string, optional) An identifier for the table.
              - \`title\`: (string, optional) The caption or title associated with the table.
              - \`column_headers\`: (array of strings) The exact headers of the table columns.
              - \`rows\`: (array of objects) Each object represents a row, with keys corresponding to the column headers.
  - \`examples\`: (array of objects, optional) A top-level array for capturing case studies, examples, or problem-solution pairs.
    - **Example Object**:
      - \`id\`: (string) A unique identifier for the example.
      - \`title\`: (string, optional) The title of the example.
      - \`question\`: (string) The descriptive question or problem statement.
      - \`analysis\`: (string) The analytical commentary, explanation, or solution provided.

Your final output must be a single JSON object containing 'totalPages', 'pagesProcessed', and the 'jsonOutput' string.

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
