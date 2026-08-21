import Link from "next/link";
import { IccMark } from "@/components/brand/icc-mark";
import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  inverted?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  compact = false,
  inverted = false,
  href = "/data",
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5 group", className)}
      aria-label="BBKA Analytics - Statistical Studio"
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 shadow-sm",
          inverted
            ? "bg-[#08a0a0] text-[#081511]"
            : "bg-[#008080] dark:bg-[#14a3a3] text-white dark:text-[#04211f]",
        )}
      >
        <IccMark className="size-6" />
      </span>
      {!compact && (
        <div className="flex flex-col">
          <span
            className={cn(
              "text-base leading-tight font-extrabold tracking-tight whitespace-nowrap text-zinc-900 dark:text-zinc-100",
              inverted && "text-white",
            )}
          >
            BBKA
            <span className={inverted ? "text-[#08a0a0]" : "text-[#008080] dark:text-[#14a3a3]"}>
              {" "}Analytics
            </span>
          </span>
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 font-mono -mt-0.5">
            Statistical Studio
          </span>
        </div>
      )}
    </Link>
  );
}
