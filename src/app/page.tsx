
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { featuredTools, Tool } from '@/lib/tools';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={tool.href} className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <tool.icon className="w-8 h-8 text-accent" />
          <CardTitle className="font-headline text-xl">{tool.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription>{tool.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 md:py-24 rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">UniToolBox</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your ultimate all-in-one toolkit for images, documents, text processing, and more. Streamline your tasks with our powerful and easy-to-use utilities.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/tools">
                Explore All Tools <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold">
              <Link href="/support/faq">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4">
        <Image 
          src="https://placehold.co/1200x400.png" 
          alt="Abstract UniToolBox representation" 
          width={1200} 
          height={400} 
          className="rounded-lg shadow-xl mx-auto"
          data-ai-hint="abstract technology banner"
        />
      </section>

      <section className="container mx-auto px-4">
        <h2 className="font-headline text-3xl font-semibold text-center mb-10">
          Featured Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-xl flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="font-headline text-3xl font-semibold mb-4">
              Ready to Boost Your Productivity?
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              UniToolBox offers a comprehensive suite of tools designed to simplify your digital tasks. From quick conversions to AI-powered assistance, we've got you covered.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link href="/tools">
                Discover All Tools
              </Link>
            </Button>
          </div>
          <div className="flex-shrink-0">
            <Image 
              src="https://placehold.co/400x300.png" 
              alt="Productivity illustration" 
              width={400} 
              height={300} 
              className="rounded-md"
              data-ai-hint="productivity tools"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
