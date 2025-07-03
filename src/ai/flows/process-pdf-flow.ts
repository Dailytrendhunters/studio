
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

// This is the schema for the final output of the flow, which the frontend consumes.
// 'jsonOutput' is a string here.
const ProcessPdfOutputSchema = z.object({
  totalPages: z.number().describe('The total number of pages in the PDF document.'),
  pagesProcessed: z.number().describe('The number of pages successfully processed from the document.'),
  jsonOutput: z
    .string()
    .describe(
      `A JSON string representing the structured content of the document.`
    ),
});
export type ProcessPdfOutput = z.infer<typeof ProcessPdfOutputSchema>;

export async function processPdf(input: ProcessPdfInput): Promise<ProcessPdfOutput> {
  return processPdfFlow(input);
}

// Below are the detailed schemas for the structured content the model should generate.

const TableSchema = z.object({
  id: z.string().optional().describe('An identifier for the table.'),
  title: z.string().optional().describe('The caption or title associated with the table.'),
  column_headers: z.array(z.string()).describe('The exact headers of the table columns.'),
  rows: z.array(z.record(z.string(), z.any())).describe('Each object represents a row, with keys corresponding to the column headers.'),
});

const SubsectionSchema = z.object({
  id: z.string().optional().describe('Identifier for the subsection.'),
  title: z.string().describe('Title of the subsection (e.g., "Definition of Terms").'),
  content: z.array(z.string()).describe('Full content of the subsection, with each paragraph as a separate string.'),
});

const SectionSchema = z.object({
  id: z.string().describe('The section identifier (e.g., "5.2").'),
  title: z.string().describe('The title of the section.'),
  paragraphs: z.array(z.string()).describe('The complete, verbatim text of each paragraph in the section.'),
  subsections: z.array(SubsectionSchema).optional().describe('For distinct parts like definitions, classifications, or legal/statutory references.'),
  tables: z.array(TableSchema).optional().describe('An array of all tables found *within this section*.'),
});

const ChapterSchema = z.object({
  id: z.string().describe('The chapter identifier (e.g., "Chapter 5").'),
  title: z.string().describe('The full title of the chapter.'),
  learning_outcomes: z.array(z.string()).describe('A list of verbatim learning outcomes or key takeaways from the chapter.'),
  sections: z.array(SectionSchema).describe('An array of section objects within the chapter.'),
});

const ExampleSchema = z.object({
  id: z.string().describe('A unique identifier for the example.'),
  title: z.string().optional().describe('The title of the example.'),
  question: z.string().describe('The descriptive question or problem statement.'),
  analysis: z.string().describe('The analytical commentary, explanation, or solution provided.'),
});

const StructuredContentSchema = z.object({
  subject: z.string().describe('The primary subject of the document (e.g., "Corporate Finance," "Quantum Mechanics," "Contract Law").'),
  chapters: z.array(ChapterSchema).describe('An array of chapter objects.'),
  examples: z.array(ExampleSchema).optional().describe('A top-level array for capturing case studies, examples, or problem-solution pairs.'),
});

// This is the schema for what the *model* should output.
// It contains the structured data as a nested object, not a string.
const ProcessPdfModelOutputSchema = z.object({
  totalPages: z.number().describe('The total number of pages in the PDF document.'),
  pagesProcessed: z.number().describe('The number of pages successfully processed from the document.'),
  structuredContent: StructuredContentSchema.describe(
      `The structured content of the document.`
    ),
});


const processPdfPrompt = ai.definePrompt({
  name: 'processPdfPrompt',
  input: {schema: ProcessPdfInputSchema},
  output: {schema: ProcessPdfModelOutputSchema}, // Use the new, fully-structured schema
  prompt: `You are a highly advanced AI specializing in document intelligence for financial, scientific, and legal domains. Your primary task is to convert the provided PDF document into a meticulously structured, machine-readable JSON format that is optimized for AI analysis, retrieval, and content generation.

The output must preserve the document's logical hierarchy and semantic meaning. Do not summarize, interpret, or add any information not present in the source document. Every piece of text, including paragraphs, list items, and table content, must be captured verbatim.

First, determine the total number of pages in the document and ensure all pages are processed.

Then, generate a single JSON object that fully conforms to the provided output schema. It is critical that the output is a single, valid JSON object that strictly adheres to the schema. Pay very close attention to data types (e.g., 'totalPages' and 'pagesProcessed' must be numbers, not strings) and the exact structure of all nested fields as described in the schema.

PDF Document for processing:
{{media url=pdfUri}}`,
});

const processPdfFlow = ai.defineFlow(
  {
    name: 'processPdfFlow',
    inputSchema: ProcessPdfInputSchema,
    outputSchema: ProcessPdfOutputSchema, // The flow's final output matches what the app expects
  },
  async (input) => {
    const {output: modelOutput} = await processPdfPrompt(input);
    
    if (!modelOutput) {
      throw new Error('The AI model returned no output.');
    }

    return {
      totalPages: modelOutput.totalPages,
      pagesProcessed: modelOutput.pagesProcessed,
      jsonOutput: JSON.stringify(modelOutput.structuredContent, null, 2),
    };
  }
);
