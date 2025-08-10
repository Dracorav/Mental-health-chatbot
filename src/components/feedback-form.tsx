'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { T } from './T';

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
  feedback: z.string().min(10, {
    message: 'Feedback must be at least 10 characters.',
  }),
});

export function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      feedback: '',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log('Feedback submitted:', data);
    toast({
      title: 'Feedback Received!',
      description: "Thank you for helping us improve.",
    });
    setSubmitted(true);
  }
  
  if (submitted) {
    return (
        <Card className="text-center">
            <CardContent className="p-10">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-semibold font-headline"><T>Thank You!</T></h2>
                <p className="mt-2 text-muted-foreground"><T>Your feedback has been successfully submitted. We appreciate you taking the time to help us.</T></p>
                <Button onClick={() => setSubmitted(false)} className="mt-6"><T>Submit Another</T></Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle><T>Feedback Form</T></CardTitle>
            <CardDescription><T>Let us know what you think.</T></CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><T>Name (Optional)</T></FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><T>Email (Optional)</T></FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel><T>Feedback</T></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg"><T>Submit Feedback</T></Button>
            </form>
          </Form>
      </CardContent>
    </Card>
  );
}
