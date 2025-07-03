
'use server';
/**
 * @fileOverview This file defines a Genkit flow to process a PDF document
 * and extract its content into a structured JSON format. It includes an
 * AI-powered repair mechanism for malformed JSON.
 *
 * - processPdf - A function that handles the PDF processing and JSON conversion.
 * - ProcessPdfInput - The input type for the processPdf function.
 * - ProcessPdfOutput - The return type for the processPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { repairJson } from './repair-json-flow';

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

// A text description of the required schema to help the repair AI.
const SCHEMA_DESCRIPTION = `The JSON object must have a 'totalPages' (number), 'pagesProcessed' (number), and a 'structuredContent' object. The 'structuredContent' object must contain:
- 'subject': string
- 'chapters': array of objects, each with 'id' (string), 'title' (string), 'learning_outcomes' (array of strings), and 'sections' (array of objects).
- 'examples': optional array of objects, each with 'id' (string), 'title' (optional string), 'question' (string), and 'analysis' (string).
Each 'section' object must contain: 'id' (string), 'title' (string), 'paragraphs' (array of strings), optional 'subsections' (array), and optional 'tables' (array).
Each 'table' object must contain: 'title' (optional string), 'column_headers' (array of strings), and 'rows' (array of objects where keys are column headers).
Pay close attention to data types. 'totalPages' and 'pagesProcessed' must be numbers. All other fields should be of the specified type.`;


const processPdfPrompt = ai.definePrompt({
  name: 'processPdfPrompt',
  input: {schema: ProcessPdfInputSchema},
  // We no longer define an output schema here so we can parse manually and trigger repair logic.
  prompt: `You are a highly advanced AI specializing in document intelligence for financial, scientific, and legal domains. Your primary task is to convert the provided PDF document into a meticulously structured, machine-readable JSON format that is optimized for AI analysis, retrieval, and content generation.

The output must preserve the document's logical hierarchy and semantic meaning. Do not summarize, interpret, or add any information not present in the source document. Every piece of text, including paragraphs, list items, and table content, must be captured verbatim.

First, determine the total number of pages in the document and ensure all pages are processed.

Then, generate a single JSON object that fully conforms to the provided output schema. It is critical that the output is a single, valid JSON object that strictly adheres to the schema. Pay very close attention to data types (e.g., 'totalPages' and 'pagesProcessed' must be numbers, not strings) and the exact structure of all nested fields as described in the schema. Do not wrap the JSON in markdown 'json' code blocks.

PDF Document for processing:
{{media url=pdfUri}}`,
});

const processPdfFlow = ai.defineFlow(
  {
    name: 'processPdfFlow',
    inputSchema: ProcessPdfInputSchema,
    outputSchema: ProcessPdfOutputSchema, // The flow's final output still matches what the app expects
  },
  async (input) => {
    // Generate raw text from the model
    const response = await processPdfPrompt.generate(input);
    const rawText = response.text;
    
    if (!rawText) {
        throw new Error('The AI model returned no text output.');
    }

    let modelOutput: z.infer<typeof ProcessPdfModelOutputSchema>;
    try {
        // First attempt to parse and validate the raw text
        const potentialJson = rawText.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(potentialJson);
        modelOutput = ProcessPdfModelOutputSchema.parse(parsed);
    } catch (e) {
        console.warn("Initial PDF processing failed, attempting AI repair.", e);
        
        // If parsing or validation fails, call the repair flow
        const repairedJsonString = await repairJson({ 
          brokenJson: rawText,
          schemaDescription: SCHEMA_DESCRIPTION
        });
        
        try {
            // Second attempt to parse and validate the repaired JSON
            const parsedRepaired = JSON.parse(repairedJsonString);
            modelOutput = ProcessPdfModelOutputSchema.parse(parsedRepaired);
            console.log("AI repair successful!");
        } catch (finalError) {
            console.error("AI repair also failed.", finalError);
            throw new Error(`PDF processing failed even after AI repair. Initial error: ${e}. Repair error: ${finalError}`);
        }
    }

    if (!modelOutput) {
      throw new Error('Model output was empty or invalid after all attempts.');
    }

    return {
      totalPages: modelOutput.totalPages,
      pagesProcessed: modelOutput.pagesProcessed,
      jsonOutput: JSON.stringify(modelOutput.structuredContent, null, 2),
    };
  }
);
