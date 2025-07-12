// FILE: client/src/components/layout/Footer.tsx
// Replace the ENTIRE content with this revised version.

import { Link } from "wouter";
import { FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa";

// --- DEFINE NEW COMBINED LOGO PATH HERE ---
// Use the same path as in Header.tsx
const logoPath = "/assets/logos/asiatek-logo-full.png"; // <-- UPDATE THIS if different (.svg?)
// ---

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="text-center md:text-left">
            {/* --- Logo Link --- */}
            <Link
              href="/"
              className="text-secondary font-medium flex items-center justify-center md:justify-start"
            >
              {/* --- Use the new combined logo path --- */}
              <img
                src={logoPath}
                alt="Asiatek Logo"
                // Adjust height/width classes as needed. Added mr-2 for spacing if needed.
                className="h-8 w-auto mr-2"
              />
              {/* --- REMOVED the separate <span>Asiatek</span> --- */}
            </Link>
            {/* --- End Logo Link --- */}
            <p className="text-muted-foreground text-sm mt-3">
              Ваш надежный поставщик автозапчастей для легковых и коммерческих
              автомобилей
            </p>
          </div>

          {/* ... rest of the footer columns ... */}

          {/* Navigation Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-['Roboto_Condensed']">
              Навигация
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-secondary transition"
                >
                  Главное
                </Link>
              </li>
              <li>
                <Link
                  href="/order"
                  className="text-muted-foreground hover:text-secondary transition"
                >
                  Запчасти
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-secondary transition"
                >
                  Связаться с нами
                </Link>
              </li>
              <li>
                <Link
                  href="/auth"
                  className="text-muted-foreground hover:text-secondary transition"
                >
                  Личный кабинет
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-['Roboto_Condensed']">
              Контакты
            </h3>
            <section className="text-muted-foreground text-sm leading-relaxed">
              <strong>Asiatek</strong>
              <br />
              г. Москва, 2-й Тушинский проезд 10
              <br />
              <a
                href="tel:+79802174850"
                className="hover:text-secondary transition"
              >
                +7 980 217-48-50
              </a>
              <br />
              <span className="mt-2 block">Email: asiatek.pro@outlook.com</span>
            </section>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-['Roboto_Condensed']">
              Социальные сети
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/asiatek.tj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://t.me/asiatekbot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition"
              >
                <FaTelegram size={24} />
              </a>
              <a
                href="https://wa.me/message/FSP6ZQKJMRVCC1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition"
              >
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Asiatek. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
