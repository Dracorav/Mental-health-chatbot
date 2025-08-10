import { RelaxationGuide } from '@/components/relaxation-guide';

export default function RelaxationPage() {
  return (
    <main className="flex-1 overflow-y-auto">
       <div className="container mx-auto max-w-3xl py-8 px-4">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Find Your Calm
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore guided exercises to help you manage stress and find balance. Select your current stress level for a personalized recommendation.
          </p>
        </div>
        <div className="mt-12">
          <RelaxationGuide />
        </div>
      </div>
    </main>
  );
}
