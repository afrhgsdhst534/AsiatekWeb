import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  passwordConfirm: z.string().min(1, "Подтвердите пароль"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [, params] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Extract token from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get('token');
    setToken(tokenParam);
    
    // Verify token if it exists
    if (tokenParam) {
      verifyTokenMutation.mutate(tokenParam);
    }
  }, []);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  // Verify the token validity
  const verifyTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest("POST", "/api/verify-reset-token", { token });
      return await res.json();
    },
    onSuccess: () => {
      setTokenVerified(true);
    },
    onError: () => {
      setTokenVerified(false);
    },
  });

  // Submit the new password
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormValues & { token: string }) => {
      const res = await apiRequest("POST", "/api/reset-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Пароль обновлен",
        description: "Ваш пароль был успешно изменен. Теперь вы можете войти в систему.",
      });
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить пароль. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (token) {
      resetPasswordMutation.mutate({
        ...values,
        token,
      });
    }
  };

  // Redirect if no token
  if (token === null && tokenVerified !== null) {
    return <Redirect to="/auth" />;
  }

  // Loading state
  if (tokenVerified === null) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Seo
          title="Проверка ссылки сброса пароля – Asiatek"
          description="Проверка ссылки для сброса пароля на сайте Asiatek."
          path="/auth/reset-password"
          noindex={true}
        />
        
        <div className="max-w-md mx-auto">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-center text-muted-foreground">Проверка ссылки для сброса пароля...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Invalid token
  if (tokenVerified === false) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Seo
          title="Ошибка сброса пароля – Asiatek"
          description="Ссылка для сброса пароля недействительна или истекла."
          path="/auth/reset-password"
          noindex={true}
        />
        
        <div className="max-w-md mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Ошибка сброса пароля</CardTitle>
              <CardDescription>
                Ссылка для сброса пароля недействительна или истекла
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Недействительная ссылка</AlertTitle>
                <AlertDescription>
                  Ссылка для сброса пароля, которую вы использовали, недействительна или истекла. 
                  Пожалуйста, запросите новую ссылку для сброса пароля.
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => navigate("/auth")}
              >
                Вернуться на страницу входа
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Valid token, show reset form
  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title="Сброс пароля – Asiatek"
        description="Сброс пароля на сайте Asiatek. Введите новый пароль для вашей учетной записи."
        path="/auth/reset-password"
        noindex={true}
      />
      
      <Breadcrumbs 
        items={[
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Авторизация", item: "https://asiatek.pro/auth", position: 2 },
          { name: "Сброс пароля", position: 3 }
        ]} 
      />
      
      <div className="max-w-md mx-auto">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Сброс пароля</CardTitle>
            <CardDescription>
              Пожалуйста, введите новый пароль для вашей учетной записи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Новый пароль</FormLabel>
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
                  control={form.control}
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
                  className="w-full bg-primary hover:bg-primary/90 text-white mt-2"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Обновление пароля...
                    </>
                  ) : (
                    "Обновить пароль"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;