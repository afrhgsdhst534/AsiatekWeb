// client/src/pages/home-page.tsx
import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FaClock, FaTools, FaSearch, FaTruck } from "react-icons/fa";
import { useIsMobile } from "@/hooks/use-mobile";
import { InfiniteMovingTicker } from "@/components/ui/infinite-moving-ticker";
import {
  firstTickerLogos,
  secondTickerLogos,
  thirdTickerLogos,
} from "@/data/car-logos";
import Seo from "@/components/seo/Seo";
import FAQ from "@/components/seo/FAQ";

const HomePage = () => {
  const isMobile = useIsMobile();

  // FAQ items for structured data
  const faqItems = [
    {
      question: "Какие автозапчасти вы предлагаете?",
      answer:
        "Мы предлагаем широкий ассортимент оригинальных и аналоговых запчастей для легковых, коммерческих и китайских автомобилей. В нашем каталоге представлены детали для Toyota, Nissan, Honda, Mitsubishi, Mazda, Isuzu, Hino, Geely, Chery, Haval и многих других марок.",
    },
    {
      question: "Как заказать запчасти в вашем магазине?",
      answer:
        "Вы можете оформить заказ, заполнив форму на нашем сайте, где нужно указать данные автомобиля, необходимые запчасти и контактную информацию. Наши специалисты свяжутся с вами для уточнения деталей заказа.",
    },
    {
      question: "Как осуществляется доставка запчастей?",
      answer:
        "Мы доставляем запчасти по всей России через транспортные компании СДЭК, Деловые Линии, ПЭК и других. Также возможен самовывоз из нашего офиса в Москве. Сроки доставки зависят от вашего региона и обычно составляют от 1 до 7 рабочих дней.",
    },
    {
      question: "Какие гарантии вы предоставляете на запчасти?",
      answer:
        "На все запчасти мы предоставляем гарантию в соответствии с гарантийной политикой производителя. На оригинальные запчасти гарантия составляет от 6 до 12 месяцев, на аналоговые – от 1 до 6 месяцев в зависимости от производителя.",
    },
    {
      question: "Можно ли вернуть или обменять запчасти?",
      answer:
        "Да, вы можете вернуть или обменять запчасти в течение 14 дней с момента получения, если они не были в использовании, сохранены товарный вид, пломбы, ярлыки и заводская упаковка. При обнаружении заводского брака срок возврата увеличивается до 30 дней.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="АВТОЗАПЧАСТИ ОПТОМ И В РОЗНИЦУ – Asiatek"
        description="Купить оригинальные и аналоговые автозапчасти для китайских, коммерческих и легковых автомобилей. Доставка по России."
        path="/"
        image="/assets/Stickers.png"
      />

      {/* Hidden FAQ component for structured data */}
      <FAQ items={faqItems} />
      {/* Hero Section */}
      <section className="relative h-[100vh] md:h-screen w-full overflow-hidden bg-gray-50">
        {/* DESKTOP: background tickers */}
        <div className="absolute inset-0 hidden md:flex flex-col justify-between overflow-hidden">
          <div className="py-6 md:py-10 lg:py-12 mt-20 md:mt-24">
            <InfiniteMovingTicker
              items={firstTickerLogos}
              direction="left"
              speed={35}
              gap={60}
              className="py-8 backdrop-blur-sm"
            />
          </div>
          <div className="py-6 md:py-10 lg:py-12">
            <InfiniteMovingTicker
              items={secondTickerLogos}
              direction="right"
              speed={25}
              gap={60}
              className="py-8 backdrop-blur-sm"
            />
          </div>
          <div className="py-6 md:py-10 lg:py-12 mb-20 md:mb-24">
            <InfiniteMovingTicker
              items={thirdTickerLogos}
              direction="left"
              speed={30}
              gap={60}
              className="py-8 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* MOBILE: three vertical tickers behind the card */}
        {isMobile && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0">
            <div className="grid grid-cols-3 gap-4 w-full h-full px-4">
              <InfiniteMovingTicker
                items={firstTickerLogos}
                direction="left"
                speed={35}
                gap={60}
                className="w-full h-full"
                verticalOnMobile
              />
              <InfiniteMovingTicker
                items={secondTickerLogos}
                direction="right"
                speed={25}
                gap={60}
                className="w-full h-full"
                verticalOnMobile
              />
              <InfiniteMovingTicker
                items={thirdTickerLogos}
                direction="left"
                speed={30}
                gap={60}
                className="w-full h-full"
                verticalOnMobile
              />
            </div>
          </div>
        )}

        {/* Content Overlay — final • locked specs */}
        <div className="relative z-10 flex items-center justify-center h-full px-4">
          <div
            className="
              flex flex-col text-center bg-white
              border-[5px] border-[rgba(172,142,104,0.2)]
              rounded-[20px] shadow-lg

              w-[90%] max-w-[402px]          /* desktop width cap */
              sm:max-w-[402px]
              px-10 py-10                    /* 40 px padding all sides */
              space-y-8                      /* equal vertical rhythm */
            "
          >
            {/* Heading */}
            <h1
              className="font-['Roboto_Condensed'] font-black tracking-[-0.03em] leading-tight
                           text-[32px] sm:text-[40px]"
            >
              АВТОЗАПЧАСТИ
              <br />
              <span className="text-black">ОПТОМ И В РОЗНИЦУ</span>
            </h1>

            {/* Copy */}
            <p className="font-['Inter'] font-medium text-sm sm:text-base leading-relaxed tracking-[-0.03em] text-gray-700/90">
              Доставим запчасти из США, Китая и Кореи в кратчайшие сроки. Для
              этого оставьте короткую заявку , которая займет пару минут. Просто
              укажите данные автомобиля, нужные запчасти и ваши контакты.
            </p>

            {/* Stickers */}
            <div className="flex justify-center">
              <img
                src="/assets/Stickers.png"
                alt="Примеры запчастей"
                className="h-[90px] sm:h-[110px] object-contain drop-shadow-md"
                draggable={false}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>

            {/* CTA */}
            <Link href="/order" className="mx-auto">
              <Button
                className="
                  bg-black hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black
                  w-full max-w-[334px] h-[60px] sm:h-[65px]
                  rounded-[15px] sm:rounded-[17px] shadow-md
                  transition-transform duration-200 hover:scale-105
                "
              >
                <span className="font-['Inter'] text-base sm:text-lg font-medium tracking-[-0.02em] uppercase">
                  ОСТАВИТЬ ЗАЯВКУ
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-gray-50/5 to-gray-50/20 pointer-events-none" />
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-secondary/5 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 font-['Roboto_Condensed'] tracking-tight">
            НАШИ ПРЕИМУЩЕСТВА
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <FaClock className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 font-['Roboto_Condensed']">
                БЫСТРЫЙ ЗАКАЗ
              </h3>
              <p className="text-muted-foreground font-['Inter'] text-base md:text-lg">
                Простая форма заказа займёт всего 3 минуты вашего времени
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <FaTools className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 font-['Roboto_Condensed']">
                ОРИГИНАЛЬНЫЕ ЗАПЧАСТИ
              </h3>
              <p className="text-muted-foreground font-['Inter'] text-base md:text-lg">
                Мы работаем только с проверенными поставщиками оригинальных
                деталей
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <FaSearch className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 font-['Roboto_Condensed']">
                ШИРОКИЙ АССОРТИМЕНТ
              </h3>
              <p className="text-muted-foreground font-['Inter'] text-base md:text-lg">
                Запчасти для любых марок автомобилей включая редкие модели
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <FaTruck className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 font-['Roboto_Condensed']">
                БЫСТРАЯ ДОСТАВКА
              </h3>
              <p className="text-muted-foreground font-['Inter'] text-base md:text-lg">
                Доставим заказ в кратчайшие сроки в любую точку России
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-primary/90 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent to-white/10" />
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 font-['Roboto_Condensed'] tracking-tight">
            ГОТОВЫ ЗАКАЗАТЬ ЗАПЧАСТИ?
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto font-['Inter'] leading-relaxed">
            Не тратьте время на поиски. Оставьте заявку, и мы поможем найти
            необходимые запчасти для вашего автомобиля по лучшим ценам.
          </p>
          <Link href="/order">
            <Button
              className="bg-white text-[#ac8e68] hover:bg-white/90 py-4 px-10 w-[280px] sm:w-[300px] md:w-[334px] h-[60px] md:h-[65px] rounded-full text-center font-medium border-[2.55px] border-white/20 shadow-lg transform transition hover:scale-105 hover:shadow-xl"
              size="lg"
            >
              <span className="font-['Inter'] text-lg sm:text-xl md:text-2xl font-medium tracking-[-0.02em] leading-none uppercase">
                ОСТАВИТЬ ЗАЯВКУ
              </span>
            </Button>
          </Link>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjIuOCAyLjIgMS44cy0xIDEuOC0yLjIgMS44LTIuMi0uOC0yLjItMS44IDEtMS44IDIuMi0xLjh6bTkuOSAzLjZjLjcgMCAxLjMuNSAxLjMgMS4xcy0uNiAxLjEtMS4zIDEuMS0xLjMtLjUtMS4zLTEuMS42LTEuMSAxLjMtMS4xeiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
      </section>
    </div>
  );
};

export default HomePage;
