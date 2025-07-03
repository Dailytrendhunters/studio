import Link from 'next/link';
import { FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-bold text-lg text-foreground">Jsonic</h2>
        </Link>
        <nav className="flex items-center gap-4">
           <Button asChild variant="ghost">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
