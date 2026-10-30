"use client";

import { useState } from "react";
import { RESEARCH } from "@/lib/research-data";

export function Citation() {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(RESEARCH.bibtex);
      setStatus("Copied");
    } catch {
      setStatus("Select the citation below to copy it.");
    }
  }
  return (
    <div className="citation-box">
      <div className="citation-heading">
        <span>BibTeX</span>
        <button type="button" onClick={copy}>
          Copy citation <span aria-hidden="true">↗</span>
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{RESEARCH.bibtex}</code>
      </pre>
      <span className="copy-status" role="status">
        {status}
      </span>
    </div>
  );
}
