import Link from "next/link";
import { FadeInHeading } from "@/components/FadeInHeading";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">404</p>
      <FadeInHeading className="text-3xl lg:text-4xl font-semibold tracking-tight text-oxblood mb-3 font-headline">
        Page not found
      </FadeInHeading>
      <p className="text-sm text-muted-foreground mb-8">This page doesn&apos;t exist or has been moved.</p>
      <Link
        href="/"
        className="inline-flex items-center px-5 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Return to home
      </Link>
    </div>
  );
}
