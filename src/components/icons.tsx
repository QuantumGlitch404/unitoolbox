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
    {/* Outer box shape */}
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    
    {/* Stylized 'U' - an arch within the top part of the box */}
    <path d="M8 13V8c0-2.21 1.79-4 4-4s4 1.79 4 4v5" />

    {/* Small gear/cog shape in the bottom center of the box */}
    <circle cx="12" cy="16" r="1.5" />
    <path d="M12 14.5V13" /> 
    <path d="M12 17.5V19" />
    <path d="M14.121 15.379l1.061-1.06" /> {/* Adjusted spoke for cog-like feel */}
    <path d="M8.818 17.682l-1.061-1.061" /> {/* Adjusted spoke */}
    <path d="M15.182 17.682l-1.061-1.061" /> {/* Adjusted spoke */}
    <path d="M9.879 15.379l-1.061-1.06" />  {/* Adjusted spoke */}
  </svg>
);
