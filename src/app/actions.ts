
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
import { ref, set, serverTimestamp } from 'firebase/database';

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
  console.log("✅ Server action 'processPdfAction' triggered. If you see this, your server console is working.");
  try {
    const result = await processPdf(input);
    
    // Save the result to Firebase Realtime Database, but only if db is initialized.
    if (db) {
        const docId = Date.now().toString();
        const dbRef = ref(db, 'processed_documents/' + docId);
        await set(dbRef, {
            pdfUri: input.pdfUri,
            jsonOutput: result.jsonOutput,
            totalPages: result.totalPages,
            pagesProcessed: result.pagesProcessed,
            createdAt: serverTimestamp()
        });
    }

    return result;
  } catch (error) {
    console.error("Error in processPdfAction:", error);
    throw new Error("Failed to process the PDF document.");
  }
}
