
'use server';

import { db } from '@/lib/firebase';
import { ref, set, serverTimestamp } from 'firebase/database';

// This file is kept for potential future use with server-side actions,
// but the current implementation uses a client-side PDF processing algorithm.
// No actions are actively called from the frontend at the moment.

export async function storeExtractionResult(
    pdfName: string, 
    extractionData: any
): Promise<void> {
  console.log("✅ Server action 'storeExtractionResult' available for use.");
  try {
    if (db) {
        const docId = Date.now().toString();
        const dbRef = ref(db, 'processed_documents/' + docId);
        await set(dbRef, {
            pdfName: pdfName,
            ...extractionData,
            createdAt: serverTimestamp()
        });
        console.log(`📝 Result for ${pdfName} stored in Firebase.`);
    } else {
        console.warn("Firebase DB not initialized. Skipping result storage.");
    }
  } catch (error) {
    console.error("Error in storeExtractionResult:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred during data storage.");
  }
}
