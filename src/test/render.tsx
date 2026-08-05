import { CssBaseline, ThemeProvider } from "@mui/material";
import { render, type RenderOptions } from "@testing-library/react";
import theme from "@/theme/theme";

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    ),
    ...options,
  });
}
