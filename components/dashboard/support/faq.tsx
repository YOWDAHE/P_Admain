"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function Faq() {
  const faqs = [
    {
      question: "How do I create an event?",
      answer:
        "To create an event, navigate to the Events page and click on the 'New Event' button. Fill in the required information such as title, description, date, time, and location. You can also add additional details like ticket prices, categories, and images.",
    },
    {
      question: "How do I manage ticket sales?",
      answer:
        "You can manage ticket sales through the Tickets page. Here, you can view all ticket purchases, issue refunds, and generate reports. You can also set up different ticket types and pricing tiers for your events.",
    },
    {
      question: "How do I promote my event?",
      answer:
        "There are several ways to promote your event. You can feature it on the platform, share it on social media, send email invitations, and use the built-in marketing tools. You can also create discount codes and early bird specials to incentivize ticket purchases.",
    },
    {
      question: "How do I handle refunds?",
      answer:
        "To process a refund, go to the Transactions page, find the transaction you want to refund, and click on the 'Refund' button. You can choose to refund the full amount or a partial amount. The refund will be processed through the original payment method.",
    },
    {
      question: "How do I contact support?",
      answer:
        "If you need assistance, you can create a support ticket by going to the Support page and clicking on the 'Create Ticket' tab. Fill in the required information and our support team will get back to you as soon as possible.",
    },
  ]

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
