
'use server';

import { 
  generateSampleJson, 
  GenerateSampleJsonInput, 
  GenerateSampleJsonOutput 
} from '@/ai/flows/generate-sample-json';
import { 
  processPdf, 
  ProcessPdfInput, 
  ProcessPdfOutput 
} from '@/ai/flows/process-pdf-flow';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function getSampleJsonAction(input: GenerateSampleJsonInput): Promise<GenerateSampleJsonOutput> {
  try {
    const result = await generateSampleJson(input);
    return result;
  } catch (error) {
    console.error("Error in getSampleJsonAction:", error);
    throw new Error("Failed to generate sample JSON data.");
  }
}

export async function processPdfAction(input: ProcessPdfInput): Promise<ProcessPdfOutput> {
  try {
    const result = await processPdf(input);
    
    // Save the result to Firestore
    const docId = Date.now().toString();
    const docRef = doc(db, 'processed_documents', docId);
    await setDoc(docRef, {
        pdfUri: input.pdfUri,
        jsonOutput: result.jsonOutput,
        totalPages: result.totalPages,
        pagesProcessed: result.pagesProcessed,
        createdAt: serverTimestamp()
    });

    return result;
  } catch (error) {
    console.error("Error in processPdfAction:", error);
    throw new Error("Failed to process the PDF document.");
  }
}
