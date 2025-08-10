'use server';

/**
 * @fileOverview An AI agent that analyzes the sentiment of user messages and adapts its responses.
 *
 * - adaptiveResponse - A function that handles the sentiment analysis and response adaptation process.
 * - AdaptiveResponseInput - The input type for the adaptiveResponse function.
 * - AdaptiveResponseOutput - The return type for the adaptiveResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveResponseInputSchema = z.object({
  message: z.string().describe('The user message to analyze.'),
});
export type AdaptiveResponseInput = z.infer<typeof AdaptiveResponseInputSchema>;

const AdaptiveResponseOutputSchema = z.object({
  sentiment: z
    .string()
    .describe('The sentiment of the message (positive, negative, or neutral).'),
  adaptedResponse: z.string().describe('The chatbot response adapted to the sentiment.'),
});
export type AdaptiveResponseOutput = z.infer<typeof AdaptiveResponseOutputSchema>;

export async function adaptiveResponse(input: AdaptiveResponseInput): Promise<AdaptiveResponseOutput> {
  return adaptiveResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveResponsePrompt',
  input: {schema: AdaptiveResponseInputSchema},
  output: {schema: AdaptiveResponseOutputSchema},
  prompt: `You are a mental wellness chatbot designed to provide supportive and calming feedback.

Analyze the sentiment of the following message and adapt your response accordingly.
If the sentiment is negative, provide more supportive and calming feedback.
If the sentiment is positive or neutral, provide an encouraging and helpful response.

Message: {{{message}}}

Sentiment: {{sentiment}}
Adapted Response:`, // Fixed typo here
  system: `You are a helpful and empathetic chatbot. Analyze the sentiment of the user's message and tailor your response to match their emotional state.`, // Added system prompt for context
});

const analyzeSentiment = ai.defineTool({
  name: 'analyzeSentiment',
  description: 'Analyzes the sentiment of a given text message.',
  inputSchema: z.object({
    text: z.string().describe('The text message to analyze.'),
  }),
  outputSchema: z.enum(['positive', 'negative', 'neutral']),
},
async (input) => {
  // Mock implementation for sentiment analysis (replace with actual sentiment analysis service).
  //In a real application, this would call a sentiment analysis API.
  console.log("Analyzing sentiment for: " + input.text);
  if (input.text.toLowerCase().includes('sad') || input.text.toLowerCase().includes('anxious') || input.text.toLowerCase().includes('stressed')) {
    return 'negative';
  } else if (input.text.toLowerCase().includes('happy') || input.text.toLowerCase().includes('good') || input.text.toLowerCase().includes('well')) {
    return 'positive';
  } else {
    return 'neutral';
  }
});

const adaptiveResponseFlow = ai.defineFlow(
  {
    name: 'adaptiveResponseFlow',
    inputSchema: AdaptiveResponseInputSchema,
    outputSchema: AdaptiveResponseOutputSchema,
  },
  async input => {
    const sentiment = await analyzeSentiment({text: input.message});
    const {output} = await prompt({ ...input, sentiment });
    return output!;
  }
);
