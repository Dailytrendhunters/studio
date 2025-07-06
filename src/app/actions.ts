'use server';

import { supabaseOperations } from '@/lib/supabase';

// Server action to store extraction results
export async function storeExtractionResult(
  fileName: string,
  fileSize: number,
  extractedData: any,
  processingTime: number,
  confidenceScore: number,
  pagesProcessed: number
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const result = await supabaseOperations.storeExtractionResult(
      fileName,
      fileSize,
      extractedData,
      processingTime,
      confidenceScore,
      pagesProcessed
    );

    if (result) {
      console.log(`✅ Result for ${fileName} stored in Supabase with ID: ${result.id}`);
      return { success: true, id: result.id };
    } else {
      return { success: false, error: 'Failed to store extraction result' };
    }
  } catch (error) {
    console.error("Error in storeExtractionResult:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during data storage.";
    return { success: false, error: errorMessage };
  }
}

// Server action to get all processed documents
export async function getProcessedDocuments() {
  try {
    const documents = await supabaseOperations.getProcessedDocuments();
    return { success: true, documents };
  } catch (error) {
    console.error("Error in getProcessedDocuments:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching documents.";
    return { success: false, error: errorMessage, documents: [] };
  }
}

// Server action to delete a document
export async function deleteDocument(id: string) {
  try {
    const success = await supabaseOperations.deleteDocument(id);
    return { success };
  } catch (error) {
    console.error("Error in deleteDocument:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while deleting the document.";
    return { success: false, error: errorMessage };
  }
}