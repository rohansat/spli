import { Footer } from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-8 pt-24 pb-24">
        <h1 className="text-[28px] font-medium text-white mb-8">TERMS OF SERVICE</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400">Last updated: March 2025</p>
          
          <h2 className="text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-zinc-400">
            By accessing or using SPLI's services, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, you may not use our services.
          </p>

          <h2 className="text-white mt-8 mb-4">2. Use of Services</h2>
          <p className="text-zinc-400">
            Our services are designed to help you manage aerospace licensing applications.
            You agree to use these services only for their intended purpose and in compliance
            with all applicable laws and regulations.
          </p>

          <h2 className="text-white mt-8 mb-4">3. User Accounts</h2>
          <p className="text-zinc-400">
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account. You must notify us immediately
            of any unauthorized use of your account.
          </p>

          <h2 className="text-white mt-8 mb-4">4. Intellectual Property</h2>
          <p className="text-zinc-400">
            All content and materials available through our services are protected by
            intellectual property rights. You may not use, copy, or distribute these
            materials without our express permission.
          </p>

          <h2 className="text-white mt-8 mb-4">5. Limitation of Liability</h2>
          <p className="text-zinc-400">
            SPLI shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages arising out of or relating to your use of our services.
          </p>

          <h2 className="text-white mt-8 mb-4">6. Changes to Terms</h2>
          <p className="text-zinc-400">
            We reserve the right to modify these terms at any time. We will notify you
            of any material changes by posting the new terms on our website.
          </p>

          <h2 className="text-white mt-8 mb-4">7. Contact</h2>
          <p className="text-zinc-400">
            For questions about these Terms of Service, please contact us at legal@spli.space
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
} 