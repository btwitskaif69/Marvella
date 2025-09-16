import React from "react";
import { Menu, Search, Heart, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import logo from '@/assets/logos/logo.svg'

// Navbar (LV-style) — shadcn + Tailwind + lucide-react
// Drop-in replacement for your provided component signature
const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-30 max-w-screen-2xl items-center justify-between px-3 md:h-22 md:px-6">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Menu (Sheet) */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="group flex items-center gap-2 text-sm text-neutral-800 hover:opacity-80"
                aria-label="Open menu"
              >
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

          {/* Search */}
          <button
            className="group flex items-center gap-2 text-sm text-neutral-800 hover:opacity-80"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Center brand */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
            <img src={logo} alt="" className="h-5 lg:h-7 w-auto" />
        </div>

        {/* Right: Call Us + icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <a
            href="#"
            className="text-sm text-neutral-800 hover:opacity-80"
            aria-label="Call Us"
          >
            Call Us
          </a>

          <Separator orientation="vertical" className="h-4" />

          <button
            className="inline-flex items-center justify-center hover:opacity-80"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            className="inline-flex items-center justify-center hover:opacity-80"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
