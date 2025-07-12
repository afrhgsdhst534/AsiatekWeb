import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import FAQ from "@/components/seo/FAQ";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PhoneInput from "@/components/ui/phone-input";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  email: z.string().email("Неверный формат email").optional().or(z.literal('')),
  phone: z.string().min(1, "Телефон обязателен"),
  countryCode: z.string().min(1, "Код страны обязателен"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
});

type FormValues = z.infer<typeof formSchema>;

const ContactPage = () => {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      countryCode: "+7",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Сообщение отправлено",
        description: "Мы скоро свяжемся с вами",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка отправки",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    contactMutation.mutate(data);
  };

  // FAQ items for structured data
  const faqItems = [
    {
      question: "Как заказать автозапчасти в вашем магазине?",
      answer: "Чтобы заказать автозапчасти, заполните форму заказа на нашем сайте, позвоните по телефону или отправьте заявку через форму обратной связи. Наши специалисты свяжутся с вами для уточнения деталей заказа."
    },
    {
      question: "Какие способы доставки вы предлагаете?",
      answer: "Мы предлагаем доставку по всей России и СНГ. Для отправки используются транспортные компании СДЭК, Деловые Линии, ПЭК и другие. Также возможен самовывоз из нашего офиса в Москве."
    },
    {
      question: "Какие гарантии вы предоставляете на запчасти?",
      answer: "Мы предоставляем гарантию на все запчасти согласно гарантийной политике производителя. На оригинальные запчасти гарантия составляет от 6 до 12 месяцев, на аналоговые – от 1 до 6 месяцев в зависимости от производителя."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title="Контакты – свяжитесь с нами – Asiatek"
        description="Свяжитесь с нами для заказа запчастей или консультации. Телефон, email и адрес для связи. Быстрая обратная связь гарантирована."
        path="/contact"
      />
      
      {/* Hidden FAQ component for structured data */}
      <FAQ items={faqItems} />
      
      <Breadcrumbs 
        items={[
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Контакты", position: 2 }
        ]} 
      />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-8">Связаться с нами</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-muted-foreground mb-6">
              Заполните форму ниже, и мы свяжемся с вами в ближайшее время. Также вы можете
              позвонить нам по телефону.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя *</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите ваше имя" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (необязательно)</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите ваш email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field: countryField }) => (
                          <PhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            countryCode={countryField.value}
                            onCountryCodeChange={countryField.onChange}
                            error={form.formState.errors.phone?.message}
                          />
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сообщение *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Опишите ваш вопрос или запрос"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white py-3 px-8 rounded-md font-medium"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    "Отправить"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div className="bg-white p-6 rounded-md border border-border">
            <h2 className="text-xl font-medium text-foreground mb-4">Контактная информация</h2>

            <div className="space-y-4">
              <div>
                <p className="font-medium">Телефон:</p>
                <a href="tel:+79802174850" className="text-secondary hover:underline">+7 980 217-48-50</a>
              </div>

              <div>
                <p className="font-medium">Email:</p>
                <a href="mailto:asiatek.pro@outlook.com" className="text-secondary hover:underline">asiatek.pro@outlook.com</a>
              </div>

              <div>
                <p className="font-medium">Адрес:</p>
                <p className="text-muted-foreground">г. Москва, 2-й Тушинский проезд 10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;