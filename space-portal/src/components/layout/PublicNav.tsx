import Link from 'next/link';

interface PublicNavProps {
  transparent?: boolean;
}

export function PublicNav({ transparent = false }: PublicNavProps) {
  return (
    <div className={`absolute top-0 right-0 left-0 z-50 p-6 ${transparent ? '' : 'bg-black/30 backdrop-blur-sm'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold tracking-wider">
          SPLI
        </Link>
        <div className="flex space-x-6 items-center">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            HOME
          </Link>
          <Link href="/company" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            COMPANY
          </Link>
          <Link href="/demo" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            DEMO
          </Link>
          <Link href="/compliance" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            COMPLIANCE
          </Link>
          <Link href="/signin" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            LOG IN
          </Link>
        </div>
      </div>
    </div>
  );
} 