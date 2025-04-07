import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-black border-t border-white/10 text-white/60">
      <div className="space-container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>SPLI © {currentYear}</p>
          </div>

          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm hover:text-white transition-colors">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="text-sm hover:text-white transition-colors">
              TERMS OF SERVICE
            </Link>
            <Link href="/contact" className="text-sm hover:text-white transition-colors">
              CONTACT
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
