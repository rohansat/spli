"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="space-container py-8 max-w-[1400px] mx-auto bg-black">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-white/70 hover:text-white transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-white mb-8">SPLI Privacy Policy</h1>
        <p className="text-white/60">Effective Date: March 15, 2024</p>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-white/80">
              Space Portal Launch Interface ("SPLI," "we," "us," or "our") respects your privacy and is committed to protecting it through this Privacy Policy. 
              This document explains how we collect, use, disclose, and safeguard your information when you use our platform, products, and services 
              related to space launch licensing and applications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <ul className="list-disc pl-6 text-white/80 space-y-2">
              <li>
                <strong className="text-white">Account Information:</strong> Name, email address, phone number, company details, 
                professional credentials, and space industry certifications.
              </li>
              <li>
                <strong className="text-white">Application Content:</strong> Launch applications, technical documentation, 
                safety analyses, environmental assessments, and related materials you upload.
              </li>
              <li>
                <strong className="text-white">Payment Information:</strong> Processed securely through our payment processor. 
                We do not store complete payment details.
              </li>
              <li>
                <strong className="text-white">Usage Data:</strong> Log files, device information, IP address, browser type, 
                and interactions with our platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-white/80 space-y-2">
              <li>To provide, maintain, and improve our launch licensing services</li>
              <li>To process and manage space launch applications</li>
              <li>To verify company credentials and manage profiles</li>
              <li>To process payments and transactions</li>
              <li>To send important updates about applications and services</li>
              <li>To enforce platform policies and regulatory requirements</li>
              <li>To analyze usage patterns for platform improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Sharing of Information</h2>
            <ul className="list-disc pl-6 text-white/80 space-y-2">
              <li>With regulatory authorities when required for launch licensing</li>
              <li>With service providers under strict data protection agreements</li>
              <li>In response to legal requests (court orders, subpoenas)</li>
              <li>During corporate transactions (mergers, acquisitions)</li>
              <li>With your explicit consent or at your direction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-white/80">
              We retain your information as long as necessary for the purposes described above, to comply with regulatory 
              requirements, or as required by law. Launch application data is retained according to federal space launch 
              licensing requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Security</h2>
            <p className="text-white/80">
              We implement industry-standard security measures to protect your data, including encryption, access controls, 
              and regular security audits. However, no system is completely secure, and we cannot guarantee absolute security 
              of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-white/80">
              You may request access to, correction of, or deletion of your personal information, subject to regulatory 
              requirements and legal obligations. Contact us at privacy@spli.space to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Updates to Privacy Policy</h2>
            <p className="text-white/80">
              We may update this Privacy Policy periodically. We will notify you of material changes through our platform 
              or by email. Continued use of our services after such modifications constitutes acceptance of the updated Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-white/80">
              For questions or concerns about this Privacy Policy, contact us at:<br />
              Email: privacy@spli.space
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 