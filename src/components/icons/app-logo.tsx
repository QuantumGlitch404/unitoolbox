import type { LucideProps } from 'lucide-react';

export const AppLogo = (props: LucideProps) => (
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
    {/* Main shield/open box shape */}
    <path d="M4 7V19c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7" />
    {/* Top lid/opening effect & subtle U */}
    <path d="M4 7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2" />
    <path d="M8 7a4 4 0 0 1 8 0" />
    
    {/* Central "spark" or "utility" symbol */}
    <path d="M12 12.5v3" /> {/* Vertical line of plus */}
    <path d="M10.5 14h3" /> {/* Horizontal line of plus */}
  </svg>
);
