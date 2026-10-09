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
      <div className="flex flex-col items-center justify-center rounded-[2rem] bg-[#f6f2ea] p-10 text-center border border-forest-abyss/5">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-forest-deep text-white">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="mb-2 font-display text-2xl text-ink">Message Prepared</h3>
        <p className="text-muted-ink mb-6">
          Your message has been prepared successfully. (Frontend simulation complete).
        </p>
        <Button 
          variant="outline" 
          onClick={() => setIsSuccess(false)}
          className="rounded-full border-forest-deep text-forest-deep hover:bg-forest-deep/10 bg-transparent h-12 px-8"
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
          <label htmlFor="name" className="text-sm font-semibold text-ink">
            Full Name
          </label>
          <Input 
            id="name" 
            required 
            placeholder="Jane Doe" 
            className="h-12 bg-white rounded-xl border-forest-abyss/10 focus-visible:ring-forest-deep/30"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-ink">
            Email Address
          </label>
          <Input 
            id="email" 
            type="email" 
            required 
            placeholder="jane@example.com" 
            className="h-12 bg-white rounded-xl border-forest-abyss/10 focus-visible:ring-forest-deep/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="purpose" className="text-sm font-semibold text-ink">
          Purpose of Contact
        </label>
        <select 
          id="purpose"
          className="flex h-12 w-full items-center justify-between rounded-xl border border-forest-abyss/10 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-forest-deep/30 disabled:cursor-not-allowed disabled:opacity-50"
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
        <label htmlFor="message" className="text-sm font-semibold text-ink">
          Message
        </label>
        <Textarea 
          id="message" 
          required 
          placeholder="How can we help you?" 
          className="min-h-[150px] bg-white resize-y rounded-xl border-forest-abyss/10 focus-visible:ring-forest-deep/30"
        />
      </div>

      <Button 
        type="submit" 
        size="lg" 
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-forest-abyss text-white hover:bg-[#1a2e25] h-14 font-bold text-base"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
