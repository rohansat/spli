"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";
import { PublicNav } from "@/components/layout/PublicNav";
import { LandingBackground } from "@/components/landing/LandingBackground";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recipients: ["harikesh.tambareni@gmail.com", "rohansathisha7@gmail.com"],
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          message: "",
        });
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="relative min-h-screen bg-black">
      <LandingBackground variant="section" />
      <PublicNav />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-24 pt-28 md:px-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-white/40">Contact</p>
        <h1 className="mb-10 text-[28px] font-medium text-white">CONTACT US</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl text-white mb-4">Get in Touch</h2>
            <p className="text-zinc-400 mb-8">
              Have questions about our services? We're here to help.
              Fill out the form and we'll get back to you as soon as possible.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Name</label>
                  <Input
                  placeholder="Your name"
                  className="bg-[#161616] border-zinc-800 text-white"
                  />
              </div>

              <div>
                <label className="block text-white mb-2">Email</label>
                  <Input
                    type="email"
                  placeholder="your@email.com"
                  className="bg-[#161616] border-zinc-800 text-white"
                  />
                </div>
              
              <div>
                <label className="block text-white mb-2">Subject</label>
                  <Input
                  placeholder="How can we help?"
                  className="bg-[#161616] border-zinc-800 text-white"
                  />
              </div>

              <div>
                <label className="block text-white mb-2">Message</label>
                <Textarea
                  placeholder="Type your message here..."
                  className="bg-[#161616] border-zinc-800 text-white min-h-[150px] max-h-[400px] overflow-y-auto"
                  autoResize={true}
                />
              </div>

              <Button className="w-full rounded-full bg-white text-black hover:bg-white/90">
                SEND MESSAGE
              </Button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl text-white mb-4">Other Ways to Reach Us</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-white font-medium mb-2">Email</h3>
                <p className="text-zinc-400">support@spli.space</p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Office</h3>
                <p className="text-zinc-400">
                  123 Space Avenue<br />
                  Houston, TX 77058<br />
                  United States
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Hours</h3>
                <p className="text-zinc-400">
                  Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                  Saturday - Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 