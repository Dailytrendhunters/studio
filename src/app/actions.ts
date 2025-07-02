
'use server';

import { 
  generateSampleJson, 
  GenerateSampleJsonInput, 
  GenerateSampleJsonOutput 
} from '@/ai/flows/generate-sample-json';
import { 
  summarizeFinancialData, 
  SummarizeFinancialDataInput, 
  SummarizeFinancialDataOutput 
} from '@/ai/flows/summarize-financial-data';
import { 
  processPdf, 
  ProcessPdfInput, 
  ProcessPdfOutput 
} from '@/ai/flows/process-pdf-flow';

export async function getSampleJsonAction(input: GenerateSampleJsonInput): Promise<GenerateSampleJsonOutput> {
  try {
    const result = await generateSampleJson(input);
    return result;
  } catch (error) {
    console.error("Error in getSampleJsonAction:", error);
    throw new Error("Failed to generate sample JSON data.");
  }
}

export async function getSummaryAction(input: SummarizeFinancialDataInput): Promise<SummarizeFinancialDataOutput> {
  try {
    const result = await summarizeFinancialData(input);
    return result;
  } catch (error) {
    console.error("Error in getSummaryAction:", error);
    throw new Error("Failed to summarize financial data.");
  }
}

export async function processPdfAction(input: ProcessPdfInput): Promise<ProcessPdfOutput> {
  try {
    const result = await processPdf(input);
    return result;
  } catch (error) {
    console.error("Error in processPdfAction:", error);
    throw new Error("Failed to process the PDF document.");
  }
}
