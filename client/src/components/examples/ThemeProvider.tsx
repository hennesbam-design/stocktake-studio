import { ThemeProvider } from "../ThemeProvider";
import { Button } from "@/components/ui/button";
import { useTheme } from "../ThemeProvider";

function ThemeToggleExample() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="p-4 space-y-4">
      <p>Current theme: {theme}</p>
      <Button onClick={toggleTheme} data-testid="button-theme-toggle">
        Toggle to {theme === "light" ? "dark" : "light"}
      </Button>
    </div>
  );
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <ThemeToggleExample />
    </ThemeProvider>
  );
}