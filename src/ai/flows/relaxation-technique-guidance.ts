'use server';

/**
 * @fileOverview Provides relaxation techniques based on user's stress level and preferences.
 *
 * - getRelaxationGuidance - A function that suggests and guides the user through relaxation techniques.
 * - RelaxationGuidanceInput - The input type for the getRelaxationGuidance function.
 * - RelaxationGuidanceOutput - The return type for the getRelaxationGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RelaxationGuidanceInputSchema = z.object({
  stressLevel: z
    .string()
    .describe('The user\'s current stress level (e.g., low, medium, high).'),
  techniquePreference: z
    .string()
    .optional()
    .describe(
      'The user\'s preferred relaxation technique (e.g., deep breathing, progressive muscle relaxation). If none, suggest one.'
    ),
});
export type RelaxationGuidanceInput = z.infer<typeof RelaxationGuidanceInputSchema>;

const RelaxationGuidanceOutputSchema = z.object({
  technique: z.string().describe('The suggested relaxation technique.'),
  instructions: z.string().describe('Detailed instructions for the technique.'),
});
export type RelaxationGuidanceOutput = z.infer<typeof RelaxationGuidanceOutputSchema>;

export async function getRelaxationGuidance(
  input: RelaxationGuidanceInput
): Promise<RelaxationGuidanceOutput> {
  return relaxationGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'relaxationGuidancePrompt',
  input: {schema: RelaxationGuidanceInputSchema},
  output: {schema: RelaxationGuidanceOutputSchema},
  prompt: `You are a relaxation guide.  Based on the user\'s stress level and preferences, suggest a relaxation technique and provide detailed instructions. 

Stress level: {{{stressLevel}}}
Preferred technique: {{{techniquePreference}}}

If the user has no preferred technique, suggest one that is appropriate for their stress level. 
Be conversational and supportive in your guidance.
`,
});

const relaxationGuidanceFlow = ai.defineFlow(
  {
    name: 'relaxationGuidanceFlow',
    inputSchema: RelaxationGuidanceInputSchema,
    outputSchema: RelaxationGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
