'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a sample JSON output
 * based on a description of PDF financial documents.
 *
 * @fileOverview - `generateSampleJson`: A function that uses GenAI to produce sample JSON representing typical output.
 * @fileOverview - `GenerateSampleJsonInput`: The input type for the `generateSampleJson` function.
 * @fileOverview - `GenerateSampleJsonOutput`: The output type for the `generateSampleJson` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSampleJsonInputSchema = z.object({
  description: z.string().describe('A description of the PDF document content.'),
});
export type GenerateSampleJsonInput = z.infer<typeof GenerateSampleJsonInputSchema>;

const GenerateSampleJsonOutputSchema = z.object({
  jsonOutput: z.string().describe('A sample JSON output based on the PDF content description.'),
});
export type GenerateSampleJsonOutput = z.infer<typeof GenerateSampleJsonOutputSchema>;

export async function generateSampleJson(input: GenerateSampleJsonInput): Promise<GenerateSampleJsonOutput> {
  return generateSampleJsonFlow(input);
}

const generateSampleJsonPrompt = ai.definePrompt({
  name: 'generateSampleJsonPrompt',
  input: {schema: GenerateSampleJsonInputSchema},
  output: {schema: GenerateSampleJsonOutputSchema},
  prompt: `You are an expert in extracting data from PDF financial documents and converting it into JSON format.
  Based on the description of the PDF content provided, generate a sample JSON output that includes metadata, extracted text,
  identified tables, and key financial data. The JSON should be well-structured and easy to understand.

  Description: {{{description}}}
  `,
});

const generateSampleJsonFlow = ai.defineFlow(
  {
    name: 'generateSampleJsonFlow',
    inputSchema: GenerateSampleJsonInputSchema,
    outputSchema: GenerateSampleJsonOutputSchema,
  },
  async input => {
    const {output} = await generateSampleJsonPrompt(input);
    return output!;
  }
);
