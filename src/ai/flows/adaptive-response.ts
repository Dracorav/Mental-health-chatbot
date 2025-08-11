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
import {translateText} from './translate-text';

const DetectLanguageInputSchema = z.object({
  text: z.string().describe('The text to detect the language of.'),
});

const DetectLanguageOutputSchema = z.object({
    languageCode: z.string().describe('The detected language code (e.g., "en", "hi", "es").'),
});

const detectLanguagePrompt = ai.definePrompt({
    name: 'detectLanguagePrompt',
    input: { schema: DetectLanguageInputSchema },
    output: { schema: DetectLanguageOutputSchema },
    prompt: `Detect the language of the following text. Respond with only the two-letter ISO 639-1 language code.

Text: {{{text}}}
`,
});

const AdaptiveResponseInputSchema = z.object({
  message: z.string().describe('The user message to analyze.'),
  language: z.string().describe('The target language for the response.'),
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
  input: {schema: z.object({ message: z.string() })},
  output: {schema: AdaptiveResponseOutputSchema},
  prompt: `A user has sent the following message.
Your task is to analyze their message, understand the underlying emotions and problems, and provide a thoughtful, supportive, and helpful response.
Go beyond simple sentiment analysis. Try to identify the core issues the user is facing (e.g., stress, anxiety, sadness, loneliness).
Based on your analysis, offer relevant insights, suggest potential coping mechanisms, or ask gentle, open-ended questions to encourage further reflection.
Your response should be empathetic and aim to help the user feel understood and less alone.

User Message: {{{message}}}
`,
  system: `You are "MindfulMe", a friendly, caring, and supportive friend from India. Your goal is to listen to the user's problems and offer simple, comfortable, and practical advice, like a close friend would. Your tone should be warm, empathetic, and encouraging. Understand and incorporate cultural nuances, family dynamics, and social contexts prevalent in India when offering guidance. You are not a licensed therapist, but you can offer guidance, coping strategies (like mentioning yoga or meditation where appropriate), and a safe space for users to express themselves. Always respond with empathy and aim to make the user feel heard and supported.`,
});


const adaptiveResponseFlow = ai.defineFlow(
  {
    name: 'adaptiveResponseFlow',
    inputSchema: AdaptiveResponseInputSchema,
    outputSchema: AdaptiveResponseOutputSchema,
  },
  async (input) => {
    // 1. Detect language of the input message
    const { output: detectionOutput } = await detectLanguagePrompt({ text: input.message });
    const detectedLanguage = detectionOutput!.languageCode;

    // 2. Translate to English if necessary
    let messageInEnglish = input.message;
    if (detectedLanguage !== 'en') {
      const translationResult = await translateText({ text: input.message, targetLanguage: 'en' });
      messageInEnglish = translationResult.translatedText;
    }

    // 3. Get the response in English
    const { output: responseOutput } = await prompt({ message: messageInEnglish });
    const responseInEnglish = responseOutput!.adaptedResponse;
    
    // 4. Translate the response to the target language if necessary
    if (input.language === 'en') {
      return { adaptedResponse: responseInEnglish };
    }
    
    const finalResponse = await translateText({ text: responseInEnglish, targetLanguage: input.language });
    return { adaptedResponse: finalResponse.translatedText };
  }
);
