import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface ProcessedDocument {
  id: string
  file_name: string
  file_size: number
  extracted_data: any
  processing_time: number
  confidence_score: number
  pages_processed: number
  created_at: string
  updated_at: string
}

// Database operations
export const supabaseOperations = {
  // Store extraction result
  async storeExtractionResult(
    fileName: string,
    fileSize: number,
    extractedData: any,
    processingTime: number,
    confidenceScore: number,
    pagesProcessed: number
  ): Promise<ProcessedDocument | null> {
    try {
      const { data, error } = await supabase
        .from('processed_documents')
        .insert({
          file_name: fileName,
          file_size: fileSize,
          extracted_data: extractedData,
          processing_time: processingTime,
          confidence_score: confidenceScore,
          pages_processed: pagesProcessed
        })
        .select()
        .single()

      if (error) {
        console.error('Error storing extraction result:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in storeExtractionResult:', error)
      return null
    }
  },

  // Get all processed documents
  async getProcessedDocuments(): Promise<ProcessedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProcessedDocuments:', error)
      return []
    }
  },

  // Get a specific document by ID
  async getDocumentById(id: string): Promise<ProcessedDocument | null> {
    try {
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching document:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getDocumentById:', error)
      return null
    }
  },

  // Delete a document
  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('processed_documents')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting document:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteDocument:', error)
      return false
    }
  }
}