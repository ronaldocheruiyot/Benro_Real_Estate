import { Navigation } from "./Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Mail, MessageCircle, Phone, Book } from "lucide-react";
import { UserRole } from "./UserManagementPage";

interface HelpSupportPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser?: UserRole;
}

export function HelpSupportPage({ onLogout, onNavigate, currentUser }: HelpSupportPageProps) {
  const faqs = [
    {
      question: "How do I add a new apartment property?",
      answer: "Navigate to the Houses page and click the 'Add Apartment' button in the top right corner. Fill in the property details including name, description, and upload an image. Click 'Add Apartment' to save.",
    },
    {
      question: "How can I manage my tenants?",
      answer: "Go to the Tenants Management section from the navigation menu. Here you can view all tenants, add new tenants, edit tenant information, and manage lease agreements.",
    },
    {
      question: "How do I handle maintenance requests?",
      answer: "Maintenance requests appear in your notifications. Click the notification bell to view new requests. You can also access all maintenance requests from the dashboard.",
    },
    {
      question: "How do I track rent payments?",
      answer: "Visit the Billing section to view all payment history, pending payments, and generate payment reports. You'll also receive notifications when payments are received.",
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export your data from the Settings page. Navigate to Settings > Data Management and select the data you want to export in CSV or PDF format.",
    },
  ];

  const contactMethods = [
    {
      icon: <Mail className="size-6 text-blue-600" />,
      title: "Email Support",
      description: "support@propertymanager.com",
      action: "Send Email",
    },
    {
      icon: <Phone className="size-6 text-blue-600" />,
      title: "Phone Support",
      description: "+1 (555) 123-4567",
      action: "Call Now",
    },
    {
      icon: <MessageCircle className="size-6 text-blue-600" />,
      title: "Live Chat",
      description: "Available 9am - 5pm EST",
      action: "Start Chat",
    },
    {
      icon: <Book className="size-6 text-blue-600" />,
      title: "Documentation",
      description: "Browse our knowledge base",
      action: "View Docs",
    },
  ];

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentUser={currentUser} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1>Help & Support</h1>
            <p className="text-neutral-600 mt-1">
              Get help and find answers to your questions
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3">{method.icon}</div>
                    <h3 className="mb-1">{method.title}</h3>
                    <p className="text-muted-foreground mb-4">{method.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      {method.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue or question..."
                    rows={6}
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
