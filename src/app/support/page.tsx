import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, MessageSquareQuestion, Mail } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <LifeBuoy className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl font-bold tracking-tight">UniToolBox Support</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
          Need help? Find answers to your questions or get in touch with our team.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <MessageSquareQuestion className="h-10 w-10 text-accent" />
            <div>
              <CardTitle className="font-headline text-2xl">FAQ</CardTitle>
              <CardDescription>Find quick answers to common questions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Browse our Frequently Asked Questions to see if your query has already been addressed.
            </p>
            <Button asChild variant="outline">
              <Link href="/support/faq">Go to FAQ</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <Mail className="h-10 w-10 text-accent" />
            <div>
              <CardTitle className="font-headline text-2xl">Contact Us</CardTitle>
              <CardDescription>Reach out to us directly for assistance.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you can't find an answer in the FAQ, feel free to send us a message.
            </p>
            <Button asChild variant="outline">
              <Link href="/support/contact">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
