'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { getRelaxationGuidance, type RelaxationGuidanceOutput } from '@/ai/flows/relaxation-technique-guidance';
import { translateText } from '@/ai/flows/translate-text';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { T } from './T';
import { useLanguage } from '@/hooks/use-language';

const formSchema = z.object({
  stressLevel: z.enum(['low', 'medium', 'high'], {
    required_error: 'You need to select a stress level.',
  }),
});

export function RelaxationGuide() {
  const [guidance, setGuidance] = useState<RelaxationGuidanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGuidance(null);
    try {
      const result = await getRelaxationGuidance({
        stressLevel: data.stressLevel,
      });

      if (language !== 'en') {
        const [translatedTechnique, translatedInstructions] = await Promise.all([
          translateText({ text: result.technique, targetLanguage: language }),
          translateText({ text: result.instructions, targetLanguage: language })
        ]);
        setGuidance({
            technique: translatedTechnique.translatedText,
            instructions: translatedInstructions.translatedText,
        });
      } else {
        setGuidance(result);
      }

    } catch (error) {
      console.error('Failed to get relaxation guidance:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
            <CardTitle><T>Assess Your Stress</T></CardTitle>
            <CardDescription><T>How are you feeling right now?</T></CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="stressLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="low" />
                          </FormControl>
                          <FormLabel className="font-normal text-base"><T>Low</T></FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <FormLabel className="font-normal text-base"><T>Medium</T></FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="high" />
                          </FormControl>
                          <FormLabel className="font-normal text-base"><T>High</T></FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <T>Get Guidance</T>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className='space-y-4'>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
      )}

      {guidance && (
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary-foreground">
                {language === 'en' ? guidance.technique : <T>{guidance.technique}</T>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none text-foreground">
                {guidance.instructions.split('\n').map((paragraph, index) => (
                    <p key={index}>{language === 'en' ? paragraph : <T>{paragraph}</T>}</p>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
