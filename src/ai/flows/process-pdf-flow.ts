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
      `A JSON string representing the structured content of the document. This JSON object must be optimized for AI analysis and preserve the document's logical hierarchy. It should capture subjects, chapters, sections, tables, and case studies as described in the prompt.`
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

Then, generate a JSON string for the 'jsonOutput' field. This JSON string MUST adhere to the following detailed structure:

- **Root Object**:
  - \`subject\`: (string) The primary subject of the document (e.g., "Corporate Finance," "Quantum Mechanics," "Contract Law").
  - \`chapters\`: (array) An array of chapter objects.
    - **Chapter Object**:
      - \`id\`: (string, optional) The chapter identifier, if present (e.g., "Chapter 5").
      - \`title\`: (string) The full title of the chapter.
      - \`objectives\` or \`key_takeaways\`: (array of strings, optional) A list of verbatim learning objectives or key takeaways from the chapter.
      - \`sections\`: (array) An array of section objects within the chapter.
        - **Section Object**:
          - \`id\`: (string, optional) The section identifier, if present (e.g., "5.2").
          - \`title\`: (string) The title of the section.
          - \`paragraphs\`: (array of strings) The complete, verbatim text of each paragraph in the section.
          - \`subsections\`: (array of objects, optional) For distinct parts like definitions, classifications, or legal/statutory references.
            - **Subsection Object**:
              - \`id\`: (string, optional) Identifier for the subsection.
              - \`title\`: (string) Title of the subsection (e.g., "Definition of Terms," "Statutory Reference 1.A").
              - \`content\`: (array of strings) Full content of the subsection, with each paragraph as a separate string.
  - \`tables\`: (array) A top-level array of all tables extracted from the document.
    - **Table Object**:
      - \`id\`: (string, optional) An identifier for the table, if present.
      - \`title\`: (string, optional) The caption or title associated with the table.
      - \`column_headers\`: (array of strings) The exact headers of the table columns.
      - \`rows\`: (array of objects) Each object represents a row, with keys corresponding to the column headers and values as the cell data.
  - \`case_studies_or_examples\`: (array of objects, optional) For capturing case studies, examples, or problem-solution pairs.
    - **Case Study/Example Object**:
      - \`id\`: (string, optional) A unique identifier.
      - \`title\`: (string, optional) The title of the case study or example.
      - \`problem\`: (string) The descriptive question or problem statement.
      - \`solution\`: (string) The analytical commentary, explanation, or solution provided.

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
