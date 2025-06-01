import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const faqItems = [
  {
    question: "What is UniToolBox?",
    answer: "UniToolBox is a comprehensive suite of online tools designed to help you with various tasks, including image editing, document conversion, text processing, and more. Our goal is to provide easy-to-use, powerful utilities all in one place."
  },
  {
    question: "Are the tools free to use?",
    answer: "Yes, all tools on UniToolBox are completely free to use."
  },
  {
    question: "Do I need to create an account?",
    answer: "No, an account is not needed to use any of the tools on UniToolBox. All features are accessible without registration."
  },
  {
    question: "Is my data safe?",
    answer: "We take data privacy and security seriously. Files uploaded for processing are typically deleted from our servers after a short period. For AI tools, data may be processed by third-party models under their respective privacy policies. Please review our Privacy Policy for detailed information."
  },
  {
    question: "Which file formats are supported?",
    answer: "Support varies by tool. Each tool page will specify the supported input and output formats. We aim to support a wide range of common file types."
  },
  {
    question: "How do I report an issue or suggest a new tool?",
    answer: "We appreciate your feedback! Please use our Contact Us page to report any issues, bugs, or to suggest new tools you'd like to see on UniToolBox."
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl md:text-4xl">Frequently Asked Questions</CardTitle>
          <CardDescription className="text-lg">
            Find answers to common questions about UniToolBox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left hover:no-underline text-base sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
