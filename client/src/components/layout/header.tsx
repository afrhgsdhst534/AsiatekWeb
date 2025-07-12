// FILE: client/src/components/layout/Header.tsx
// Replace the ENTIRE content with this revised version.

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

// --- DEFINE NEW COMBINED LOGO PATH HERE ---
// !!! UPDATE THIS PATH if your filename/format is different !!!
const logoPath = "/assets/logos/asiatek-logo-full.png"; // Or .svg
// ---

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    closeMenu();
  };

  const isActiveLink = (path: string) => {
    return location === path
      ? "text-secondary"
      : "text-foreground hover:text-secondary";
  };

  return (
    <header className="border-b border-border">
      {/* Main Header Bar */}
      <div
        className="container mx-auto py-3 px-[20px] flex justify-between items-center"
        style={{ maxWidth: "1328px", height: "48px" }}
      >
        {/* Logo Link */}
        <Link
          href="/"
          className="text-secondary font-medium text-xl flex items-center"
        >
          {/* --- Use the new combined logo path --- */}
          <img
            src={logoPath}
            alt="Asiatek Logo"
            // Adjust height/width classes as needed for the new aspect ratio
            className="h-8 w-auto" // Keep height, let width adjust automatically
          />
          {/* --- REMOVED the separate <span>Asiatek</span> --- */}
        </Link>

        {/* ... rest of nav, mobile menu ... */}
        <nav className="hidden md:flex items-center space-x-[30px]">
          <Link
            href="/"
            className={`${isActiveLink("/")} transition uppercase font-['Roboto_Condensed'] px-[18px] py-[18px]`}
          >
            Главное
          </Link>
          <Link
            href="/order"
            className={`${isActiveLink("/order")} transition uppercase font-['Roboto_Condensed'] px-[18px] py-[18px]`}
          >
            Запчасти
          </Link>
          <Link
            href="/contact"
            className={`${isActiveLink("/contact")} transition uppercase font-['Roboto_Condensed'] px-[18px] py-[18px]`}
          >
            Связаться с нами
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`${isActiveLink("/dashboard")} transition uppercase font-['Roboto_Condensed']`}
              >
                Личный кабинет
              </Link>
              <Button
                variant="ghost"
                className="uppercase font-['Roboto_Condensed']"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                Выйти
              </Button>
            </div>
          ) : (
            <Link
              href="/auth"
              className={`${isActiveLink("/auth")} transition uppercase font-['Roboto_Condensed']`}
            >
              Войти / Зарегистрироваться
            </Link>
          )}
        </nav>

        <button
          className="md:hidden text-foreground"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>{" "}
      {/* End Main Header Bar */}
      {/* Mobile Menu Panel (Conditional) */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-4 py-2 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']"
              onClick={closeMenu}
            >
              ГЛАВНОЕ
            </Link>
            <Link
              href="/order"
              className="block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']"
              onClick={closeMenu}
            >
              ЗАПЧАСТИ
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']"
              onClick={closeMenu}
            >
              СВЯЗАТЬСЯ С НАМИ
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']"
                  onClick={closeMenu}
                >
                  ЛИЧНЫЙ КАБИНЕТ
                </Link>
                <button
                  className="block w-full text-left px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  ВЫЙТИ
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']"
                onClick={closeMenu}
              >
                ВОЙТИ / ЗАРЕГИСТРИРОВАТЬСЯ
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
