'use server';
/**
 * @fileOverview Summarizes key financial data extracted from a PDF document.
 *
 * - summarizeFinancialData - A function that summarizes financial data.
 * - SummarizeFinancialDataInput - The input type for the summarizeFinancialData function.
 * - SummarizeFinancialDataOutput - The return type for the summarizeFinancialData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFinancialDataInputSchema = z.object({
  jsonData: z.string().describe('The JSON data extracted from the financial PDF document.'),
});
export type SummarizeFinancialDataInput = z.infer<typeof SummarizeFinancialDataInputSchema>;

const SummarizeFinancialDataOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key financial data.'),
});
export type SummarizeFinancialDataOutput = z.infer<typeof SummarizeFinancialDataOutputSchema>;

export async function summarizeFinancialData(input: SummarizeFinancialDataInput): Promise<SummarizeFinancialDataOutput> {
  return summarizeFinancialDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFinancialDataPrompt',
  input: {schema: SummarizeFinancialDataInputSchema},
  output: {schema: SummarizeFinancialDataOutputSchema},
  prompt: `You are an expert financial analyst. Please provide a concise summary of the key financial data presented in the following JSON data:\n\n{{jsonData}}\n\nFocus on the most important financial figures and trends. The summary should be no more than 200 words.`,
});

const summarizeFinancialDataFlow = ai.defineFlow(
  {
    name: 'summarizeFinancialDataFlow',
    inputSchema: SummarizeFinancialDataInputSchema,
    outputSchema: SummarizeFinancialDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
