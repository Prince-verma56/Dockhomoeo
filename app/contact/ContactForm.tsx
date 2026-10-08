"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay for frontend-only state
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-sage-50 p-10 text-center border border-sage-100">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-leaf-800 text-white">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="mb-2 font-display text-2xl text-forest-abyss">Message Prepared</h3>
        <p className="text-forest-abyss/70 mb-6">
          Your message has been prepared successfully. (Frontend simulation complete).
        </p>
        <Button 
          variant="outline" 
          onClick={() => setIsSuccess(false)}
          className="rounded-full"
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-forest-abyss">
            Full Name
          </label>
          <Input 
            id="name" 
            required 
            placeholder="Jane Doe" 
            className="h-12 bg-white"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-forest-abyss">
            Email Address
          </label>
          <Input 
            id="email" 
            type="email" 
            required 
            placeholder="jane@example.com" 
            className="h-12 bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="purpose" className="text-sm font-medium text-forest-abyss">
          Purpose of Contact
        </label>
        <select 
          id="purpose"
          className="flex h-12 w-full items-center justify-between rounded-lg border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="" disabled selected hidden>Select a topic...</option>
          <option value="general">General Enquiry</option>
          <option value="product">Product Enquiry</option>
          <option value="order">Order Support</option>
          <option value="partnership">Partnership</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-forest-abyss">
          Message
        </label>
        <Textarea 
          id="message" 
          required 
          placeholder="How can we help you?" 
          className="min-h-[150px] bg-white resize-y"
        />
      </div>

      <Button 
        type="submit" 
        size="lg" 
        disabled={isSubmitting}
        className="w-full rounded-full bg-forest-abyss text-white hover:bg-forest-abyss/90 h-12"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
