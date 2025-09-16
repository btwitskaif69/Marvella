// "use client"
import React, { useEffect, useState } from "react";
import { Menu, Search, Heart, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logos/logo.svg";

function cx(...c) { return c.filter(Boolean).join(" "); }

const NAV_H_MOBILE = "h-16";   // 64px
const NAV_H_DESKTOP = "md:h-20"; // 80px

const Navbar = ({ threshold = 40, reserveSpace = false }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const text = scrolled ? "text-neutral-800" : "text-white";

  return (
    <>
      <header
        className={cx(
          // FIX: use fixed so it doesn't push the hero down
          "fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300",
          scrolled
            ? "bg-white border-b border-neutral-200 backdrop-blur supports-[backdrop-filter]:bg-white"
            : "bg-transparent border-transparent"
        )}
      >
        <div className={cx("mx-auto flex max-w-screen-2xl items-center justify-between px-3 md:px-6", NAV_H_MOBILE, NAV_H_DESKTOP)}>
          {/* Left */}
          <div className="flex items-center gap-4 md:gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <button className={cx("group flex items-center gap-2 text-sm hover:opacity-80", text)} aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                  <span className="hidden sm:inline">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-semibold tracking-wide">Menu</h3>
                  <nav className="space-y-3 text-sm">
                    <a className="block hover:underline" href="#">New Arrivals</a>
                    <a className="block hover:underline" href="#">Women</a>
                    <a className="block hover:underline" href="#">Men</a>
                    <a className="block hover:underline" href="#">Bags</a>
                    <a className="block hover:underline" href="#">Perfumes</a>
                    <a className="block hover:underline" href="#">Gifts</a>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <button className={cx("group flex items-center gap-2 text-sm hover:opacity-80", text)} aria-label="Search">
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Center brand */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
            <img src={logo} alt="Brand" className={cx("h-5 w-auto lg:h-7", scrolled ? "" : "invert")} />
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 md:gap-6">
            <a href="#" className={cx("text-sm hover:opacity-80", text)} aria-label="Call Us">Call Us</a>
            <Separator orientation="vertical" className={cx("h-4 transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-0")} />
            <button className={cx("inline-flex items-center justify-center hover:opacity-80", text)} aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </button>
            <button className={cx("inline-flex items-center justify-center hover:opacity-80", text)} aria-label="Account">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer: only if you want content BELOW the navbar.
          For a hero that should sit UNDER the transparent navbar, keep reserveSpace=false */}
      {reserveSpace && (
        <div className={cx(NAV_H_MOBILE, NAV_H_DESKTOP)} aria-hidden />
      )}
    </>
  );
};

export default Navbar;
