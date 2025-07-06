-- Create processed_documents table
CREATE TABLE IF NOT EXISTS processed_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  extracted_data JSONB NOT NULL,
  processing_time INTEGER NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  pages_processed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE processed_documents ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- For now, allowing all operations - you can restrict this later
CREATE POLICY "Allow all operations on processed_documents" 
ON processed_documents 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_processed_documents_created_at 
ON processed_documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_processed_documents_file_name 
ON processed_documents(file_name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_processed_documents_updated_at 
BEFORE UPDATE ON processed_documents 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();