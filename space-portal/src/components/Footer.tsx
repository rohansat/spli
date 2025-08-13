import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800/50">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
        <div className="text-zinc-500">SPLI © 2025</div>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="text-zinc-500 hover:text-white transition-colors">
            PRIVACY POLICY
          </Link>
          <Link href="/terms-of-service" className="text-zinc-500 hover:text-white transition-colors">
            TERMS OF SERVICE
          </Link>
          <Link href="/compliance" className="text-zinc-500 hover:text-white transition-colors">
            COMPLIANCE
          </Link>
          <Link href="/contact" className="text-zinc-500 hover:text-white transition-colors">
            CONTACT
          </Link>
        </div>
      </div>
    </footer>
  );
} 