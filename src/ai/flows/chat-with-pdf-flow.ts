'use server';
/**
 * @fileOverview This file defines a Genkit flow that uses Retrieval-Augmented Generation (RAG)
 * to answer questions about a document's text content.
 *
 * - chatWithPdf - A function that handles the chat interaction.
 * - ChatWithPdfInput - The input type for the chatWithPdf function.
 * - ChatWithPdfOutput - The return type for the chatWithPdf function.
 */

import {ai} from '@/ai/genkit';
import {z, Document} from 'genkit';

const ChatWithPdfInputSchema = z.object({
  fullText: z.string().describe("The full text content of the PDF document."),
  query: z.string().describe("The user's question about the document."),
});
export type ChatWithPdfInput = z.infer<typeof ChatWithPdfInputSchema>;

const ChatWithPdfOutputSchema = z.object({
  answer: z.string().describe("The AI-generated answer to the user's query, based on the document content."),
});
export type ChatWithPdfOutput = z.infer<typeof ChatWithPdfOutputSchema>;


export async function chatWithPdf(input: ChatWithPdfInput): Promise<ChatWithPdfOutput> {
  return chatWithPdfFlow(input);
}

const chatPrompt = `You are an expert financial assistant. Your task is to answer the user's question based *only* on the provided document context.
If the information to answer the question is not in the context, you must state that you cannot answer based on the provided document.
Do not make up information. Be concise and helpful.

Question:
{{{query}}}
`;

const chatWithPdfFlow = ai.defineFlow(
  {
    name: 'chatWithPdfFlow',
    inputSchema: ChatWithPdfInputSchema,
    outputSchema: ChatWithPdfOutputSchema,
  },
  async ({fullText, query}) => {
    // 1. Create Document chunks from the full text.
    // The model will use these chunks as the context for answering the query.
    const chunks = fullText.split('\n\n').filter(chunk => chunk.trim().length > 20);
    const context = chunks.map(content => Document.fromText(content));
    
    // 2. Generate a response using the document chunks as context.
    const {output} = await ai.generate({
      prompt: chatPrompt,
      context, // The document chunks are passed here as context.
      input: {query},
    });

    return {
      answer: output?.text ?? "Sorry, I couldn't generate a response.",
    };
  }
);
