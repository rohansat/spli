import Link from "next/link";

export function PublicNav() {
  return (
    <div className="flex items-center gap-6">
      <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
        HOME
      </Link>
      <Link href="/company" className="text-sm font-medium text-white/80 hover:text-white">
        COMPANY
      </Link>
      <Link href="/demo" className="text-sm font-medium text-white/80 hover:text-white">
        DEMO
      </Link>
      <Link href="/signin" className="text-sm font-medium text-white/80 hover:text-white">
        LOG IN
      </Link>
    </div>
  );
} 