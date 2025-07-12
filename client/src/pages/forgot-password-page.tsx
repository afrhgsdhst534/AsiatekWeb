import { useState } from "react";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Неверный формат email"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormValues) => {
      const res = await apiRequest("POST", "/api/forgot-password", data);
      return await res.json();
    },
    onSuccess: () => {
      setEmailSent(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить ссылку для сброса пароля. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title="Восстановление пароля – Asiatek"
        description="Восстановление доступа к личному кабинету на сайте Asiatek. Введите ваш email для получения инструкций по сбросу пароля."
        path="/auth/forgot-password"
        noindex={true}
      />
      
      <Breadcrumbs 
        items={[
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Авторизация", item: "https://asiatek.pro/auth", position: 2 },
          { name: "Восстановление пароля", position: 3 }
        ]} 
      />
      
      <div className="max-w-md mx-auto">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Восстановление пароля</CardTitle>
            <CardDescription>
              {emailSent 
                ? "Проверьте вашу электронную почту" 
                : "Введите ваш email для восстановления пароля"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <>
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <AlertTitle>Письмо отправлено</AlertTitle>
                  <AlertDescription>
                    Мы отправили инструкции по сбросу пароля на указанный email. 
                    Пожалуйста, проверьте вашу почту (включая папку спам) и следуйте 
                    инструкциям в письме.
                  </AlertDescription>
                </Alert>
                <Button
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  onClick={() => navigate("/auth")}
                >
                  Вернуться на страницу входа
                </Button>
              </>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ваш email" 
                            type="email" 
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
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      "Отправить ссылку для сброса"
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      type="button"
                      variant="link"
                      className="text-secondary p-0 h-auto"
                      onClick={() => navigate("/auth")}
                    >
                      Вернуться на страницу входа
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;