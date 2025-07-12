// client/src/components/brand/BrandPage.tsx
import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import FAQ from "@/components/seo/FAQ";
import ProductLD from "@/components/seo/ProductLD";

export type BrandPageProps = {
  brand: {
    slug: string;
    name: string;
    fullName?: string;
    description: string;
    models?: string[];
    logoSrc?: string;
  };
};

const formatBrandName = (name: string) => {
  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const BrandPage: React.FC<BrandPageProps> = ({ brand }) => {
  const displayName = formatBrandName(brand.name);
  const fullBrandName = brand.fullName || displayName;
  
  // Example product data for schema.org markup
  const exampleParts = [
    {
      sku: "P001",
      name: "Тормозные колодки",
      image: "https://asiatek.pro/assets/brake-pads.jpg",
      price: 1200,
      avgRating: 4.7,
      reviewCount: 12
    },
    {
      sku: "P002",
      name: "Масляный фильтр",
      image: "https://asiatek.pro/assets/oil-filter.jpg",
      price: 450,
      avgRating: 4.5,
      reviewCount: 8
    },
    {
      sku: "P003",
      name: "Амортизатор передний",
      image: "https://asiatek.pro/assets/shock-absorber.jpg",
      price: 3500,
      avgRating: 4.9,
      reviewCount: 15
    }
  ];
  
  // FAQ items for structured data
  const faqItems = [
    {
      question: `Как узнать номер детали ${displayName}?`,
      answer: `Номер детали ${displayName} можно найти в каталоге запчастей, на шильдике оригинальной детали, или связавшись с нашими специалистами, которые помогут определить нужную деталь по VIN номеру автомобиля.`
    },
    {
      question: `Сколько стоят запчасти для ${displayName}?`,
      answer: `Стоимость запчастей ${displayName} зависит от конкретной детали, её оригинальности и наличия. Оставьте заявку, и наши менеджеры предоставят вам детальную информацию по ценам.`
    },
    {
      question: `Как заказать запчасти ${displayName}?`,
      answer: `Чтобы заказать запчасти ${displayName}, воспользуйтесь формой заказа на нашем сайте, позвоните нам или напишите в чат. Мы поможем подобрать необходимые детали по vin-коду автомобиля.`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title={`Запчасти для ${displayName} – Asiatek`}
        description={`Купить оригинальные и аналоговые запчасти для ${fullBrandName}. Широкий ассортимент, гарантия качества. Доставка по СНГ.`}
        path={`/zapchasti/${brand.slug}`}
        brand={displayName}
        type="product"
      />
      
      <Breadcrumbs 
        items={[
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Запчасти", item: "https://asiatek.pro/zapchasti", position: 2 },
          { name: displayName.toUpperCase(), position: 3 }
        ]} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-6">Запчасти для {displayName}</h1>
          
          <div className="prose max-w-none mb-8">
            <p className="text-lg">{brand.description}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Оригинальные и аналоговые запчасти {fullBrandName}</h2>
            <p className="mb-4">
              В нашем каталоге представлен широкий ассортимент оригинальных и аналоговых запчастей для автомобилей {displayName}.
              Мы предлагаем только качественные запчасти от проверенных поставщиков.
            </p>
          </div>
          
          {brand.models && brand.models.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Каталог деталей {displayName} {brand.models.join(', ')}</h2>
              <p className="mb-4">
                У нас вы найдете запчасти для различных моделей {displayName}: {brand.models.join(', ')}.
                Наши специалисты помогут вам подобрать необходимые детали по VIN-коду вашего автомобиля.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {brand.models.map((model, index) => (
                  <Link key={index} href={`/zapchasti/${brand.slug}/${model.toLowerCase()}`}>
                    <div className="border p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                      <h3 className="font-medium">{displayName} {model}</h3>
                      <p className="text-sm text-gray-500">Запчасти и комплектующие</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Popular parts section with ProductLD schema */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Популярные запчасти {displayName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exampleParts.map((part) => (
                <div key={part.sku} className="border rounded-lg p-4 hover:shadow-md transition">
                  <img 
                    src={part.image} 
                    alt={`${part.name} для ${displayName}`}
                    className="w-full h-48 object-contain mb-3" 
                  />
                  <h3 className="font-medium text-lg">{part.name} для {displayName}</h3>
                  <div className="flex justify-between mt-2 mb-4">
                    <span className="font-bold text-lg">{part.price} ₽</span>
                    <div className="flex items-center">
                      <span className="text-amber-500">★</span>
                      <span className="ml-1">{part.avgRating}</span>
                    </div>
                  </div>
                  <Link href={`/zapchasti/${brand.slug}/${part.sku.toLowerCase()}`}>
                    <Button variant="outline" className="w-full">
                      Подробнее
                    </Button>
                  </Link>
                  
                  {/* Schema.org markup for this product (hidden from UI) */}
                  <ProductLD
                    id={`https://asiatek.pro/zapchasti/${brand.slug}/${part.sku.toLowerCase()}`}
                    name={`${part.name} для ${displayName}`}
                    brand={displayName}
                    image={part.image}
                    price={part.price}
                    rating={part.avgRating}
                    reviewCount={part.reviewCount}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Как заказать запчасти {displayName} в Душанбе / Москве</h2>
            <p className="mb-4">
              Чтобы заказать запчасти {displayName}, просто оставьте заявку на нашем сайте или свяжитесь с нами по телефону.
              Наши специалисты помогут вам подобрать необходимые детали и оформить заказ.
            </p>
            
            <Link href="/order">
              <Button className="mt-4" size="lg">
                Оставить заявку
              </Button>
            </Link>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Часто задаваемые вопросы</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
            <div className="flex justify-center mb-6">
              {brand.logoSrc ? (
                <img 
                  src={brand.logoSrc} 
                  alt={`Логотип ${displayName} запчасти`} 
                  className="h-32 object-contain"
                />
              ) : (
                <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-4 text-center">{displayName}</h3>
            <p className="text-gray-600 mb-6 text-center">
              Оригинальные и аналоговые запчасти для автомобилей {displayName}
            </p>
            
            <div className="space-y-4">
              <Link href="/order">
                <Button className="w-full" size="lg">
                  Заказать запчасти
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Консультация специалиста
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden FAQ component for structured data */}
      <FAQ items={faqItems} />
    </div>
  );
};

export default BrandPage;