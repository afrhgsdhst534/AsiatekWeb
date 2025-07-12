import React from "react";
import OrderForm from "@/components/order/order-form";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import FAQ from "@/components/seo/FAQ";

const OrderPage = () => {
  // FAQ items for structured data
  const faqItems = [
    {
      question: "Как заказать запчасти на сайте?",
      answer: "Для заказа запчастей воспользуйтесь формой на этой странице. Укажите информацию о вашем автомобиле, необходимые детали и свои контактные данные. Наши специалисты свяжутся с вами для уточнения деталей заказа."
    },
    {
      question: "Как узнать стоимость запчастей?",
      answer: "После оформления заказа наши менеджеры свяжутся с вами и предоставят информацию о стоимости запчастей, сроках доставки и способах оплаты."
    },
    {
      question: "Какие способы оплаты доступны?",
      answer: "Мы предлагаем различные способы оплаты: банковской картой, банковским переводом, наличными при получении (при доставке курьером или самовывозе)."
    },
    {
      question: "Какие сроки доставки запчастей?",
      answer: "Сроки доставки зависят от наличия запчастей на складе и вашего региона. В среднем, доставка занимает от 1 до 7 рабочих дней. Точные сроки доставки вам сообщит менеджер при подтверждении заказа."
    }
  ];

  return (
    <>
      <Seo
        title="Заказать автозапчасти – быстрая форма заказа – Asiatek"
        description="Заказать оригинальные и аналоговые запчасти для китайских, коммерческих и легковых автомобилей. Доставка по России. Простая форма заказа."
        path="/order"
      />
      
      {/* Hidden FAQ component for structured data */}
      <FAQ items={faqItems} />
      
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs 
          items={[
            { name: "Главная", item: "https://asiatek.pro", position: 1 },
            { name: "Заказ запчастей", position: 2 }
          ]} 
        />
      </div>
      
      <OrderForm />
    </>
  );
};

export default OrderPage;
