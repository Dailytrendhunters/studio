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
  schemaDescription: z.string().describe('A description of the expected JSON schema structure.'),
});
export type RepairJsonInput = z.infer<typeof RepairJsonInputSchema>;

// The output is now the repaired JSON string itself.
const RepairJsonOutputSchema = z.string();
export type RepairJsonOutput = z.infer<typeof RepairJsonOutputSchema>;

export async function repairJson(input: RepairJsonInput): Promise<RepairJsonOutput> {
  return repairJsonFlow(input);
}

const repairJsonPrompt = ai.definePrompt({
  name: 'repairJsonPrompt',
  input: {schema: RepairJsonInputSchema},
  // No output schema is defined here because we want the raw text output from the model.
  prompt: `You are an expert JSON repair bot. The following text is supposed to be a single, valid JSON object that conforms to a specific schema, but it is broken. It might have syntax errors, trailing commas, incorrect data types, or extraneous text and formatting like 'json' markers.

Please analyze the text and return only the corrected, valid JSON object. Do not provide any explanation, comments, or surrounding text. The final output must be a single, raw JSON object and nothing else.

Here is a description of the schema the JSON should adhere to:
{{{schemaDescription}}}

Here is the broken JSON:
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
    const response = await repairJsonPrompt.generate(input);
    const repaired = response.text?.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    if (!repaired) {
      throw new Error('AI repair model returned no output.');
    }
    
    return repaired;
  }
);
