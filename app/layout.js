import { Open_Sans, STIX_Two_Text } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-open-sans",
  display: "swap",
});

const stixTwoText = STIX_Two_Text({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["italic"],
  variable: "--font-stix-two-text",
  display: "swap",
});

export const metadata = {
  title: "AI Support Assistant Demo",
  description:
    "Enterprise AI Support Assistant — powered by Microsoft Copilot Studio, Azure OpenAI, and Azure AI Search.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${openSans.variable} ${stixTwoText.variable}`}>
      <body>{children}</body>
    </html>
  );
}
