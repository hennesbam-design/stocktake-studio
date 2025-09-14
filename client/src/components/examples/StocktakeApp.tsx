import { StocktakeApp } from "../StocktakeApp";
import { ThemeProvider } from "../ThemeProvider";

export default function StocktakeAppExample() {
  return (
    <ThemeProvider>
      <StocktakeApp />
    </ThemeProvider>
  );
}