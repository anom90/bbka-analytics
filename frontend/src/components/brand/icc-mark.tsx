import { cn } from "@/lib/utils";

/**
 * Lambang BBKA: kurva karakteristik butir (ICC) — kurva logistik khas Item
 * Response Theory, inti dari analisis data dan psikometri yang dikerjakan
 * BBKA Course.
 */

export function IccMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path
        d="M6 25C14 25 18 7 26 7"
        stroke="currentColor"
        strokeWidth={5}
      />
    </svg>
  );
}

export function IccMarkDetailed({ className }: { className?: string }) {
  const curve = "M32 95C46 95 54 87 62 69C70 51 78 37 104 34";
  const dots = [
    [50, 91],
    [64, 65],
    [92, 39],
  ];

  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path
        d="M22 18v88h88"
        stroke="currentColor"
        strokeWidth={3.5}
        opacity={0.32}
      />
      <path
        d="M64 65v41"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeDasharray="1 9"
        opacity={0.4}
      />
      <path d={curve} stroke="currentColor" strokeWidth={22} opacity={0.12} />
      <path d={curve} stroke="currentColor" strokeWidth={9} />

      {dots.map(([cx, cy]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r={11} fill="currentColor" opacity={0.25} />
          <circle cx={cx} cy={cy} r={5} fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}
