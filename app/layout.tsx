import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./research.css";
import { SiteNav } from "@/components/SiteNav";
import { RESEARCH } from "@/lib/research-data";
export const metadata: Metadata = {
  title: `${RESEARCH.title} ${RESEARCH.subtitle}`,
  description:
    "Capability-Driven Multimodal Scaling Law: predict VLM performance from text capability and multimodal data. 34 language backbones, 7 families, over 150 VLMs.",
  openGraph: {
    title: RESEARCH.title,
    description: RESEARCH.subtitle,
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteNav />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="research-footer">
          <div className="research-container">
            <LinkHome />
            <span>Meituan · Tsinghua University</span>
            <a href={RESEARCH.arxiv} target="_blank" rel="noreferrer">
              arXiv:2608.00013 ↗
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
function LinkHome() {
  return (
    <a href="#main-content" className="footer-brand">
      CDM Scaling <span>Text → Vision</span>
    </a>
  );
}
