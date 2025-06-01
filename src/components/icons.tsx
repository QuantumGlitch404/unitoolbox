import type { LucideProps } from 'lucide-react';

export const Logo = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Main shape: combination of a box (toolbox) and a 'U' (Uni) */}
    <path d="M4 7V19c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7" /> {/* Outer box part */}
    <path d="M8 21V11c0-2.21 1.79-4 4-4s4 1.79 4 4v10" /> {/* Inner 'U' part */}

    {/* Tool accent: gear-like or wrench like element */}
    <circle cx="12" cy="11" r="1.5" /> {/* Center of a gear */}
    <path d="M12 7v2.5" /> {/* Top spoke */}
    <path d="M12 12.5V15" /> {/* Bottom spoke (shorter for 'U' space) */}
    <path d="M15.928 8.072l-1.768 1.768" /> {/* Top-right spoke */}
    <path d="M8.072 13.928l1.768-1.768" /> {/* Bottom-left spoke (shorter) */}
    <path d="M15.928 13.928l-1.768-1.768" /> {/* Bottom-right spoke */}
    <path d="M8.072 8.072l1.768 1.768" /> {/* Top-left spoke */}

    {/* Line at the top of the box, like a lid or handle */}
    <path d="M4 7h16" />
  </svg>
);
