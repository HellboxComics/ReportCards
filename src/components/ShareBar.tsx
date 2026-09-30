"use client";

import { useState } from "react";

/**
 * POST YOUR GRADES (X intent), SAVE IMAGE (the OG card PNG), COPY LINK.
 * Every action degrades to a plain link when the browser API is missing.
 */
export function ShareBar({
  intentUrl,
  cardUrl,
  imageUrl,
  fileName,
}: {
  intentUrl: string;
  cardUrl: string;
  imageUrl: string;
  fileName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
    } catch {
      const t = document.createElement("textarea");
      t.value = cardUrl;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  async function save(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 4000);
    } catch {
      window.open(imageUrl, "_blank", "noopener");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="share">
      <a className="btn btn-post" href={intentUrl} target="_blank" rel="noopener noreferrer">
        <span className="btn-post-label">POST YOUR GRADES</span>
        <span className="btn-post-sub">on X — make them show theirs</span>
      </a>
      <div className="share-row">
        <a className="btn btn-ghost" href={imageUrl} download={fileName} onClick={save}>
          {saving ? "PRINTING…" : "SAVE IMAGE"}
        </a>
        <button type="button" className="btn btn-ghost" onClick={copy} aria-live="polite">
          {copied ? "LINK COPIED ✓" : "COPY LINK"}
        </button>
      </div>
    </div>
  );
}
