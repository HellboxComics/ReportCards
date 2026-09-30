import Link from "next/link";
import type { ReactNode } from "react";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Report Cards home">
      <span className="logo-f" aria-hidden>
        F
      </span>
      <span className="logo-word">
        REPORT<span>CARDS</span>
      </span>
    </Link>
  );
}

export function TopBar({ right }: { right?: ReactNode }) {
  return (
    <div className="topbar">
      <Logo />
      <div className="topbar-right">{right}</div>
    </div>
  );
}
