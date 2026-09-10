import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "MediKiosk — AI Clinical History Platform",
  description:
    "AI-powered clinical history software platform for Indian hospitals. Record comprehensive medical histories through voice conversation and guided touchscreen interaction.",
  keywords:
    "MediKiosk, AI, clinical history, ABHA, ABDM, hospital, healthcare, India, SIH",
  authors: [{ name: "Team Inferno" }],
  openGraph: {
    title: "MediKiosk — AI Clinical History Platform",
    description:
      "AI-powered patient case-taking software for Indian hospitals.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#060a1a" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
