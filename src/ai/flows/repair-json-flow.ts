'use server';
/**
 * @fileOverview This file defines a Genkit flow to repair a broken JSON string.
 *
 * - repairJson - A function that takes a malformed JSON string and uses an AI to fix it.
 * - RepairJsonInput - The input type for the repairJson function.
 * - RepairJsonOutput - The return type for the repairJson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RepairJsonInputSchema = z.object({
  brokenJson: z.string().describe('The broken or malformed JSON string that needs to be repaired.'),
});
export type RepairJsonInput = z.infer<typeof RepairJsonInputSchema>;

const RepairJsonOutputSchema = z.object({
  repairedJson: z.string().describe('The repaired, valid JSON string.'),
});
export type RepairJsonOutput = z.infer<typeof RepairJsonOutputSchema>;

export async function repairJson(input: RepairJsonInput): Promise<RepairJsonOutput> {
  return repairJsonFlow(input);
}

const repairJsonPrompt = ai.definePrompt({
  name: 'repairJsonPrompt',
  input: {schema: RepairJsonInputSchema},
  output: {schema: RepairJsonOutputSchema},
  prompt: `You are an expert JSON repair bot. The following text is supposed to be a single, valid JSON object, but it is broken. It might have syntax errors, trailing commas, or extraneous text and formatting like 'json' markers.

Please analyze the text and return only the corrected, valid JSON object. Do not provide any explanation, comments, or surrounding text.

Broken JSON:
{{{brokenJson}}}
`,
});

const repairJsonFlow = ai.defineFlow(
  {
    name: 'repairJsonFlow',
    inputSchema: RepairJsonInputSchema,
    outputSchema: RepairJsonOutputSchema,
  },
  async (input) => {
    const {output} = await repairJsonPrompt(input);
    if (!output) {
      throw new Error('AI repair model returned no output.');
    }
    // Sometimes the model still wraps the output in ```json ... ```, so let's strip it.
    const repaired = output.repairedJson.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return { repairedJson: repaired };
  }
);
