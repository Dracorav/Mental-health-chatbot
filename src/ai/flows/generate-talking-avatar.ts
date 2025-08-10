'use server';

/**
 * @fileOverview A Genkit flow that generates a talking avatar video.
 *
 * This flow takes text as input, converts it to speech, and then uses a
 * video generation model to create a video of an avatar speaking that audio.
 * It uses a static image of the avatar as a base.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { textToSpeech } from './text-to-speech';

// Define the input schema for the main flow
const GenerateTalkingAvatarInputSchema = z.object({
  textToSpeak: z.string().describe('The text the avatar should speak.'),
  avatarImageUrl: z.string().url().describe('The URL of the avatar image.'),
});
export type GenerateTalkingAvatarInput = z.infer<typeof GenerateTalkingAvatarInputSchema>;

// Define the output schema for the main flow
const GenerateTalkingAvatarOutputSchema = z.object({
  videoDataUri: z.string().describe("The generated talking avatar video as a data URI."),
});
export type GenerateTalkingAvatarOutput = z.infer<typeof GenerateTalkingAvatarOutputSchema>;

// Exported function that other parts of the app will call
export async function generateTalkingAvatar(
  input: GenerateTalkingAvatarInput
): Promise<GenerateTalkingAvatarOutput> {
  return generateTalkingAvatarFlow(input);
}

// The main flow definition
const generateTalkingAvatarFlow = ai.defineFlow(
  {
    name: 'generateTalkingAvatarFlow',
    inputSchema: GenerateTalkingAvatarInputSchema,
    outputSchema: GenerateTalkingAvatarOutputSchema,
  },
  async (input) => {
    // Step 1: Convert the input text to speech
    const ttsResponse = await textToSpeech(input.textToSpeak);
    const audioDataUri = ttsResponse.media;

    // Step 2: Fetch the avatar image from the provided URL
    const imageResponse = await fetch(input.avatarImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from ${input.avatarImageUrl}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    const avatarImageDataUri = `data:${contentType};base64,${Buffer.from(imageBuffer).toString('base64')}`;

    // Step 3: Generate the video using the Veo model
    let { operation } = await ai.generate({
      model: 'googleai/veo-2.0-generate-001',
      prompt: [
        { text: 'Make the person in the image speak the following audio.' },
        { media: { url: avatarImageDataUri, contentType: contentType } },
        { media: { url: audioDataUri, contentType: 'audio/wav' } },
      ],
      config: {
        durationSeconds: 5,
        aspectRatio: '1:1',
      },
    });

    if (!operation) {
      throw new Error('Video generation operation failed to start.');
    }

    // Step 4: Poll for the result of the long-running video generation operation
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before checking again
      operation = await ai.checkOperation(operation);
    }
    
    if (operation.error) {
      throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const videoPart = operation.output?.message?.content.find(p => !!p.media && p.media.contentType === 'video/mp4');

    if (!videoPart?.media?.url) {
      throw new Error('Generated video not found in the operation result.');
    }
    
    return {
      videoDataUri: videoPart.media.url,
    };
  }
);
