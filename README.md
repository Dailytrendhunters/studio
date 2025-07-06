# PDF to JSON Converter

A modern web application that converts PDF documents into structured JSON format with AI-powered analysis and chat functionality.

## Features

- **Smart PDF Processing**: Upload and process PDF documents with intelligent text extraction
- **Interactive Chat**: Ask questions about your processed documents
- **Data Storage**: All processed documents are securely stored in Supabase
- **JSON Export**: Download or copy structured JSON output
- **Processing History**: View all previously processed documents
- **Responsive Design**: Works seamlessly across all devices

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pdf-to-json-converter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up the database:
Run the migration file in your Supabase SQL editor:
```sql
-- Copy and paste the contents of supabase/migrations/001_create_processed_documents.sql
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses a single table `processed_documents` with the following structure:

- `id`: UUID primary key
- `file_name`: Original PDF filename
- `file_size`: File size in bytes
- `extracted_data`: JSONB containing the processed document data
- `processing_time`: Processing duration in milliseconds
- `confidence_score`: AI confidence score (0-1)
- `pages_processed`: Number of pages processed
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## API Routes

The application uses Next.js Server Actions for backend operations:

- `storeExtractionResult`: Store processed document data
- `getProcessedDocuments`: Retrieve all processed documents
- `deleteDocument`: Delete a specific document

## Deployment

1. Deploy to your preferred platform (Vercel, Netlify, etc.)
2. Set up environment variables in your deployment platform
3. Ensure your Supabase project is properly configured with RLS policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.