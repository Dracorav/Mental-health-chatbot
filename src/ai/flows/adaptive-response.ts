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
  adaptedResponse: z.string().describe('The chatbot response adapted to the user\'s message.'),
});
export type AdaptiveResponseOutput = z.infer<typeof AdaptiveResponseOutputSchema>;

export async function adaptiveResponse(input: AdaptiveResponseInput): Promise<AdaptiveResponseOutput> {
  return adaptiveResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveResponsePrompt',
  input: {schema: AdaptiveResponseInputSchema},
  output: {schema: AdaptiveResponseOutputSchema},
  prompt: `A user has sent the following message.
Your task is to analyze their message, understand the underlying emotions and problems, and provide a thoughtful, supportive, and helpful response.
Go beyond simple sentiment analysis. Try to identify the core issues the user is facing (e.g., stress, anxiety, sadness, loneliness).
Based on your analysis, offer relevant insights, suggest potential coping mechanisms, or ask gentle, open-ended questions to encourage further reflection.
Your response should be empathetic and aim to help the user feel understood and less alone.

User Message: {{{message}}}
`,
  system: `You are "MindfulMe", a compassionate and knowledgeable AI companion for mental wellness. Your goal is to provide thoughtful, insightful, and supportive responses to help users navigate their feelings and challenges. You are not a licensed therapist, but you can offer guidance, coping strategies, and a safe space for users to express themselves. Always respond with empathy and aim to empower the user. Your response should be tailored to the user's message, providing specific, actionable advice where appropriate.`,
});


const adaptiveResponseFlow = ai.defineFlow(
  {
    name: 'adaptiveResponseFlow',
    inputSchema: AdaptiveResponseInputSchema,
    outputSchema: AdaptiveResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
