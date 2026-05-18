import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  showText?: boolean;
}

export function Logo({ className, href = "/", showText = true }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 font-bold tracking-tight transition-opacity hover:opacity-90",
        className,
      )}
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600/20 dark:bg-indigo-500 dark:ring-indigo-500/20">
        <Image
          src="/logo.png"
          alt="Logo"
          width={24}
          height={24}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-xl text-transparent dark:from-white dark:to-slate-300">
          AtomicGoals
        </span>
      )}
    </Link>
  );
}
