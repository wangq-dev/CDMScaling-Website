import Link from "next/link";
export function SiteNav() {
  return (
    <header className="research-nav">
      <div className="research-container nav-inner">
        <Link href="/" className="research-brand" aria-label="CDM Scaling home">
          <span className="brand-mark" aria-hidden="true">
            ↗
          </span>
          CDM<span>Scaling</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/#method">Method</Link>
          <Link href="/#results">Results</Link>
          <Link href="/#findings">Findings</Link>
          <Link href="/#citation">Citation</Link>
        </nav>
      </div>
    </header>
  );
}
