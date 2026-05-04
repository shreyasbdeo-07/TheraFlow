import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata = {
  title: "TheraFlow — Your Safe Space to Talk",
  description:
    "TheraFlow is a calm, private AI-powered mental wellness companion. Talk, reflect, and track your emotional well-being.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts are loaded in globals.css via @import */}
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

