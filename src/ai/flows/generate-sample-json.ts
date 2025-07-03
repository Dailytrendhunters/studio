'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a sample JSON output
 * based on a description of PDF financial documents.
 *
 * - generateSampleJson - A function that uses GenAI to produce sample JSON representing typical output.
 * - GenerateSampleJsonInput - The input type for the `generateSampleJson` function.
 * - GenerateSampleJsonOutput - The output type for the `generateSampleJson` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSampleJsonInputSchema = z.object({
  description: z.string().describe('A description of the PDF document content.'),
});
export type GenerateSampleJsonInput = z.infer<typeof GenerateSampleJsonInputSchema>;

// This is the final output schema that the frontend consumes.
const GenerateSampleJsonOutputSchema = z.object({
  jsonOutput: z.string().describe('A sample JSON output based on the PDF content description.'),
});
export type GenerateSampleJsonOutput = z.infer<typeof GenerateSampleJsonOutputSchema>;


export async function generateSampleJson(input: GenerateSampleJsonInput): Promise<GenerateSampleJsonOutput> {
  return generateSampleJsonFlow(input);
}

// Define a structured schema for the sample data the model will generate.
const SampleFinancialDataSchema = z.object({
    companyName: z.string().describe("The name of the fictional company."),
    reportingPeriod: z.string().describe("The financial reporting period, e.g., 'Q4 2023'."),
    summary: z.string().describe("A brief, one-sentence summary of the financial performance."),
    financialHighlights: z.array(z.object({
        metric: z.string().describe("The name of the financial metric, e.g., 'Revenue'."),
        value: z.string().describe("The value of the metric, e.g., '$10.5M'."),
        change: z.string().describe("The period-over-period change, e.g., '+5%'."),
    })).describe("A list of key financial highlights.")
}).describe("A structured object representing sample financial data.");

// This is the schema for what the *model* should output.
const GenerateSampleJsonModelOutputSchema = z.object({
    sampleData: SampleFinancialDataSchema,
});

const generateSampleJsonPrompt = ai.definePrompt({
  name: 'generateSampleJsonPrompt',
  input: {schema: GenerateSampleJsonInputSchema},
  output: {schema: GenerateSampleJsonModelOutputSchema}, // Use the new, fully-structured schema
  prompt: `You are an expert in creating sample financial data.
  Based on the following description, generate a plausible but fictional sample financial report in the required JSON format.
  Ensure the data is realistic for the given scenario.

  Description: {{{description}}}
  `,
});

const generateSampleJsonFlow = ai.defineFlow(
  {
    name: 'generateSampleJsonFlow',
    inputSchema: GenerateSampleJsonInputSchema,
    outputSchema: GenerateSampleJsonOutputSchema, // The flow's final output matches what the app expects
  },
  async (input) => {
    const {output: modelOutput} = await generateSampleJsonPrompt(input);
    
    if (!modelOutput) {
        throw new Error('The AI model returned no output for sample data.');
    }

    return {
      jsonOutput: JSON.stringify(modelOutput.sampleData, null, 2),
    };
  }
);
