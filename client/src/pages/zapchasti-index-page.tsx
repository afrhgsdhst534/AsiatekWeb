// client/src/pages/zapchasti-index-page.tsx
import React from "react";
import { Link } from "wouter";
import { 
  chineseBrands, 
  commercialBrands, 
  passengerBrands 
} from "@/data/brands";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import FAQ from "@/components/seo/FAQ";

const formatBrandName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const ZapchastiIndexPage: React.FC = () => {
  // FAQ items for structured data
  const faqItems = [
    {
      question: "Какие марки автомобилей вы обслуживаете?",
      answer: "Мы предлагаем запчасти для широкого спектра автомобилей, включая китайские грузовики (Geely, Chery, Haval, Great Wall), европейские грузовики (Isuzu, Hino, Mitsubishi Fuso) и легковые автомобили (Toyota, Nissan, Honda, Mitsubishi, Mazda)."
    },
    {
      question: "Вы продаете оригинальные запчасти или аналоги?",
      answer: "Мы предлагаем как оригинальные запчасти от производителей автомобилей, так и качественные аналоги от проверенных поставщиков. При оформлении заказа вы можете указать свои предпочтения."
    },
    {
      question: "Как определить нужную мне запчасть?",
      answer: "Для определения нужной запчасти вы можете использовать каталог на нашем сайте, выбрав марку и модель вашего автомобиля. Также вы можете указать VIN-номер вашего автомобиля при заказе, и наши специалисты помогут подобрать необходимые детали."
    },
    {
      question: "Сколько времени занимает доставка запчастей?",
      answer: "Сроки доставки зависят от наличия запчастей на складе и вашего региона. В среднем, доставка по Москве занимает 1-2 дня, по России – от 3 до 10 дней в зависимости от удаленности региона."
    },
    {
      question: "Предоставляете ли вы гарантию на запчасти?",
      answer: "Да, мы предоставляем гарантию на все запчасти. На оригинальные запчасти гарантия составляет от 6 до 12 месяцев, на аналоговые – от 1 до 6 месяцев в зависимости от производителя."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title="Каталог запчастей для грузовых и легковых автомобилей – Asiatek"
        description="Широкий выбор запчастей для китайских, европейских грузовых и легковых автомобилей. Оригинальные и аналоговые запчасти с доставкой по всей России и СНГ."
        path="/zapchasti"
      />
      
      {/* Hidden FAQ component for structured data */}
      <FAQ items={faqItems} />
      
      <Breadcrumbs 
        items={[
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Запчасти", position: 2 }
        ]} 
      />
      
      <h1 className="text-4xl font-bold mb-10 text-center md:text-left">Каталог запчастей</h1>
      
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Запчасти для китайских грузовиков</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {chineseBrands.map((brand) => (
            <Link key={brand.slug} href={`/zapchasti/${brand.slug}`}>
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
                <div className="flex justify-center mb-4 h-24">
                  {brand.logoSrc ? (
                    <img 
                      src={brand.logoSrc} 
                      alt={`Логотип ${formatBrandName(brand.name)} запчасти`} 
                      className="h-full object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{brand.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-center">{formatBrandName(brand.name)}</h3>
                <p className="text-center text-gray-500 mt-2 text-sm">
                  Запчасти для {brand.fullName || formatBrandName(brand.name)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Запчасти для европейских грузовиков</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {commercialBrands.map((brand) => (
            <Link key={brand.slug} href={`/zapchasti/${brand.slug}`}>
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
                <div className="flex justify-center mb-4 h-24">
                  {brand.logoSrc ? (
                    <img 
                      src={brand.logoSrc} 
                      alt={`Логотип ${formatBrandName(brand.name)} запчасти`} 
                      className="h-full object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{brand.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-center">{formatBrandName(brand.name)}</h3>
                <p className="text-center text-gray-500 mt-2 text-sm">
                  Запчасти для {brand.fullName || formatBrandName(brand.name)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Запчасти для легковых автомобилей</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {passengerBrands.map((brand) => (
            <Link key={brand.slug} href={`/zapchasti/${brand.slug}`}>
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
                <div className="flex justify-center mb-4 h-24">
                  {brand.logoSrc ? (
                    <img 
                      src={brand.logoSrc} 
                      alt={`Логотип ${formatBrandName(brand.name)} запчасти`} 
                      className="h-full object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{brand.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-center">{formatBrandName(brand.name)}</h3>
                <p className="text-center text-gray-500 mt-2 text-sm">
                  Запчасти для {brand.fullName || formatBrandName(brand.name)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZapchastiIndexPage;