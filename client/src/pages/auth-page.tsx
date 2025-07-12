import { useState } from "react";
import { Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PhoneInput from "@/components/ui/phone-input";
import { PasswordInput } from "@/components/ui/password-input";

const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(1, "Введите пароль"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  fullName: z.string().min(1, "Имя обязательно"),
  email: z.string().email("Неверный формат email"),
  phone: z.string().min(1, "Телефон обязателен"),
  countryCode: z.string().min(1, "Код страны обязателен"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  passwordConfirm: z.string().min(1, "Подтвердите пароль"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      countryCode: "+7",
      password: "",
      passwordConfirm: "",
    },
  });
  
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  };
  
  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phone: values.phone,
      countryCode: values.countryCode,
      city: "",
    });
  };
  
  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  // FAQ items for structured data
  const faqItems = [
    {
      question: "Как зарегистрироваться на сайте?",
      answer: "Для регистрации на сайте перейдите на страницу авторизации, выберите вкладку 'Регистрация', заполните необходимые поля и нажмите кнопку 'Зарегистрироваться'. После регистрации вы получите доступ к личному кабинету."
    },
    {
      question: "Какие преимущества дает регистрация на сайте?",
      answer: "Регистрация позволяет вам отслеживать статус заказов, сохранять историю заказов для повторных покупок, получать уведомления о статусе заказа, а также делать заказы быстрее и удобнее."
    },
    {
      question: "Что делать, если я забыл пароль?",
      answer: "Если вы забыли пароль, нажмите на ссылку 'Забыли пароль?' на странице входа. Введите свой email, и мы отправим вам инструкции по восстановлению пароля."
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title="Вход и регистрация – личный кабинет – Asiatek"
        description="Войдите в личный кабинет или зарегистрируйтесь на сайте Asiatek. Отслеживайте статус заказов, сохраняйте историю и делайте повторные заказы быстрее."
        path="/auth"
      />
      
      {/* Hidden FAQ component for structured data */}
      <FAQ items={faqItems} />
      
      <Breadcrumbs 
        items={[
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Авторизация", position: 2 }
        ]} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div>
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex w-full mb-6 rounded-xl overflow-hidden border border-border">
              <TabsTrigger 
                value="login" 
                className="flex-1 py-4 rounded-none bg-white data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=inactive]:bg-[#f5f1e9] data-[state=inactive]:text-muted-foreground"
              >
                Вход
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="flex-1 py-4 rounded-none bg-white data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=inactive]:bg-[#f5f1e9] data-[state=inactive]:text-muted-foreground"
              >
                Регистрация
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Вход в аккаунт</CardTitle>
                  <CardDescription>
                    Войдите для доступа к личному кабинету и истории заказов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Ваш email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                              <PasswordInput placeholder="Ваш пароль" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center justify-between">
                        <FormField
                          control={loginForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Запомнить меня
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="button"
                          variant="link"
                          className="text-secondary p-0 h-auto"
                          onClick={() => window.location.href = "/auth/forgot-password"}
                        >
                          Забыли пароль?
                        </Button>
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Вход...
                          </>
                        ) : (
                          "Войти"
                        )}
                      </Button>
                      
                      <div className="text-center mt-4 text-sm text-muted-foreground">
                        Нет аккаунта?{" "}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-secondary"
                          onClick={() => setActiveTab("register")}
                        >
                          Зарегистрироваться
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Регистрация</CardTitle>
                  <CardDescription>
                    Создайте аккаунт для заказа запчастей и отслеживания заказов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                              <Input placeholder="Ваше имя" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Ваш email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormField
                              control={registerForm.control}
                              name="countryCode"
                              render={({ field: countryField }) => (
                                <PhoneInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  countryCode={countryField.value}
                                  onCountryCodeChange={countryField.onChange}
                                  error={registerForm.formState.errors.phone?.message}
                                />
                              )}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                              <PasswordInput
                                placeholder="Минимум 6 символов"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Подтверждение пароля</FormLabel>
                            <FormControl>
                              <PasswordInput
                                placeholder="Повторите пароль"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Регистрация...
                          </>
                        ) : (
                          "Зарегистрироваться"
                        )}
                      </Button>
                      
                      <div className="text-center mt-4 text-sm text-muted-foreground">
                        Уже есть аккаунт?{" "}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-secondary"
                          onClick={() => setActiveTab("login")}
                        >
                          Войти
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden md:flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Заказывайте автозапчасти быстро и удобно
          </h2>
          <p className="text-muted-foreground mb-4">
            После регистрации вы сможете:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Делать заказы в несколько кликов</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Отслеживать статус ваших заказов</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Сохранять историю заказов для повторных покупок</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Получать уведомления о статусе заказа</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
