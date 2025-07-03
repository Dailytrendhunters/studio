import Link from 'next/link';
import { FileText } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-bold text-lg text-foreground">Jsonic</h2>
        </Link>
      </div>
    </header>
  );
}
