import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto px-8 pt-24 pb-24">
        <h1 className="text-[28px] font-medium text-white mb-8">PRIVACY POLICY</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400">Last updated: March 2025</p>
          
          <h2 className="text-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-zinc-400">
            We collect information that you provide directly to us, including when you create an account,
            submit applications, or communicate with us. This may include your name, email address,
            company information, and any other information you choose to provide.
          </p>

          <h2 className="text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-zinc-400">
            We use the information we collect to provide, maintain, and improve our services,
            to process your applications, and to communicate with you about your account and applications.
          </p>

          <h2 className="text-white mt-8 mb-4">3. Information Sharing</h2>
          <p className="text-zinc-400">
            We do not share your personal information with third parties except as necessary
            to provide our services or as required by law.
          </p>

          <h2 className="text-white mt-8 mb-4">4. Data Security</h2>
          <p className="text-zinc-400">
            We implement appropriate technical and organizational measures to protect your
            personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-white mt-8 mb-4">5. Contact Us</h2>
          <p className="text-zinc-400">
            If you have any questions about this Privacy Policy, please contact us at privacy@spli.space
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
} 