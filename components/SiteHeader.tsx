import Link from "next/link";
import TanukiLogo from "./TanukiLogo";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b-2" style={{ borderColor: "var(--line)", backgroundColor: "var(--paper)" }}>
      <Link href="/">
        <TanukiLogo />
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/survey"
          className="font-bold text-xs uppercase tracking-widest py-2 px-4"
          style={{ color: "var(--off-black)" }}
        >
          Help us build
        </Link>
        <Link
          href="/commander"
          className="font-bold text-xs uppercase tracking-widest py-2 px-4 border-2"
          style={{ borderColor: "var(--black)" }}
        >
          Commander
        </Link>
      </div>
    </header>
  );
}
