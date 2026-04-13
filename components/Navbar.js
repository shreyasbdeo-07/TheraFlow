"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser]         = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, setUser);
    } catch {
      // Firebase not configured yet — show logged-out state
    }
    return unsub;
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-bold text-stone-800 hover:text-sage-700 transition-colors">
          TheraFlow
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="/about"   current={pathname}>About</NavLink>
          <NavLink href="/privacy" current={pathname}>Privacy</NavLink>
        </div>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">
              Open App
            </Link>
          ) : (
            <>
              <Link href="/login"  className="btn-ghost text-sm">Sign In</Link>
              <Link href="/signup" className="btn-primary text-sm py-2 px-5">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, current, children }) {
  const active = current === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active ? "text-sage-700" : "text-stone-500 hover:text-stone-800"
      }`}
    >
      {children}
    </Link>
  );
}
