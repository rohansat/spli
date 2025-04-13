import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-8 pt-12 pb-24">
        <Link 
          href="/" 
          className="inline-flex items-center text-zinc-400 hover:text-white mb-12"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-[32px] font-medium text-white mb-4">SPLI PRIVACY POLICY</h1>
        <p className="text-zinc-400 mb-12">Effective Date: March 15, 2024</p>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl text-white mb-4">INTRODUCTION</h2>
            <p className="text-zinc-400 leading-relaxed">
              Space Portal Launch Interface ("SPLI," "we," "us," or "our") respects your privacy and is committed to protecting it through this Privacy Policy. This document explains how we collect, use, disclose, and safeguard your information when you use our platform, products, and services related to space launch licensing and applications.
            </p>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">INFORMATION WE COLLECT</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-white font-medium">Account Information:</span>
                <span className="text-zinc-400">Name, email address, phone number, company details, professional credentials, and space industry certifications.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-white font-medium">Application Content:</span>
                <span className="text-zinc-400">Launch applications, technical documentation, safety analyses, environmental assessments, and related materials you upload.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-white font-medium">Payment Information:</span>
                <span className="text-zinc-400">Processed securely through our payment processor. We do not store complete payment details.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-white font-medium">Usage Data:</span>
                <span className="text-zinc-400">Log files, device information, IP address, browser type, and interactions with our platform.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl text-white mb-4">HOW WE USE YOUR INFORMATION</h2>
            <ul className="space-y-3 text-zinc-400">
              <li>• To provide, maintain, and improve our launch licensing services</li>
              <li>• To process and manage space launch applications</li>
              <li>• To verify company credentials and manage profiles</li>
              <li>• To process payments and transactions</li>
              <li>• To send important updates about applications and services</li>
              <li>• To enforce platform policies and regulatory requirements</li>
              <li>• To analyze usage patterns for platform improvement</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
} 