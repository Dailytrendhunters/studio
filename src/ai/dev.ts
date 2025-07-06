import { config } from 'dotenv';
config();

import '@/ai/flows/generate-sample-json.ts';
import '@/ai/flows/process-pdf-flow.ts';
import '@/ai/flows/repair-json-flow.ts';
import '@/ai/flows/chat-with-pdf-flow.ts';
