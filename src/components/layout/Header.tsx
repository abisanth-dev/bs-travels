"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNav, secondaryNav } from "@/content/navigation";
import { site, telHref, whatsappHref } from "@/content/site";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "./Logo";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab" && panel) {
        const items = panel.querySelectorAll<HTMLElement>("a,button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-500 ${
        solid ? "border-b border-line bg-navy/90 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="rounded-md text-ivory" aria-label={`${site.name}, home`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-full px-3.5 py-2 text-[0.92rem] transition-colors hover:text-ivory ${
                      active ? "text-ivory" : "text-ivory-dim"
                    }`}
                  >
                    {item.label}
                    {active ? <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-gold" aria-hidden /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/appointment" className="hidden text-[0.92rem] text-ivory-dim hover:text-ivory xl:inline-block xl:px-3">
            Appointment
          </Link>
          <Link href="/enquire" className={buttonClass("primary", "hidden min-h-11 px-5 sm:inline-flex")}>
            Plan My Journey
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ivory lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <Icon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-line bg-navy lg:hidden"
      >
        <nav aria-label="Mobile" className="px-5 pb-10 pt-6 sm:px-8">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home" }, ...primaryNav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="font-display flex min-h-12 items-center justify-between border-b border-line py-3 text-2xl aria-[current=page]:text-gold"
                >
                  {item.label}
                  <Icon name="arrow-right" size={18} className="text-ivory-faint" />
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex min-h-11 items-center text-ivory-dim hover:text-ivory">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3">
            <Link href="/enquire" className={buttonClass("primary")}>
              Plan My Journey
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <a href={telHref()} className={buttonClass("secondary")}>
                <Icon name="phone" size={18} /> Call
              </a>
              <a href={whatsappHref()} className={buttonClass("secondary")} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={18} /> WhatsApp
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
