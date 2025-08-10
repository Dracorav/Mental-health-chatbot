import { FeedbackForm } from '@/components/feedback-form';

export default function FeedbackPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Share Your Thoughts
          </h1>
          <p className="text-lg text-muted-foreground">
            We value your experience and would love to hear your feedback. It helps us grow and improve MindfulMe for everyone.
          </p>
        </div>
        <div className="mt-12">
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
