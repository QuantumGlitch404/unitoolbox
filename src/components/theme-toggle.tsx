
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  // Initialize state to "dark" to match RootLayout's default <html className="dark">
  // The actual theme is confirmed and potentially updated after mounting.
  const [theme, setThemeState] = React.useState<"dark" | "theme-light">("dark");
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
    // After mounting, accurately determine the theme from the DOM
    // This handles cases where the class might have been changed by other scripts
    // or if the initial assumption was incorrect.
    const isDarkMode = document.documentElement.classList.contains("dark");
    setThemeState(isDarkMode ? "dark" : "theme-light");
  }, []); // Runs once after initial mount

  React.useEffect(() => {
    if (!hasMounted) return; // Only apply theme changes after initial mount

    // Apply the theme to the document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, hasMounted]);
  
  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === "dark" ? "theme-light" : "dark"));
  }

  // Render a placeholder until the component has mounted.
  // This ensures the server output and initial client output are identical for this spot,
  // preventing layout shifts and potential hydration mismatches.
  if (!hasMounted) {
    // Placeholder should ideally match the size of the actual button.
    // The Button component with size="icon" is h-10 w-10 (40px by 40px).
    return <div style={{ width: '40px', height: '40px' }} aria-hidden="true" />;
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
