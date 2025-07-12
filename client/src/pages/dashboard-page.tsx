/* --------------------------------------------------------------------------
   Dashboard – Personal cabinet (final polished version)
--------------------------------------------------------------------------- */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";

import {
  Loader2,
  Package,
  User,
  LogOut,
  ChevronRight,
  Edit,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

import {
  Order,
  Vehicle,
  Part,
  SelectUser,
} from "@shared/schema";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

/* ------------------------------------------------------------------ utils */

const statusLabels: Record<
  string,
  { label: string; color: string }
> = {
  new: { label: "Новый", color: "bg-blue-100 text-blue-800" },
  processing: {
    label: "В обработке",
    color: "bg-yellow-100 text-yellow-800",
  },
  shipped: {
    label: "Отправлен",
    color: "bg-purple-100 text-purple-800",
  },
  delivered: {
    label: "Выполнен",
    color: "bg-green-100 text-green-800",
  },
  cancelled: { label: "Отменен", color: "bg-red-100 text-red-800" },
};

const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("ru-RU").format(new Date(d));

const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  city: z.string().optional(),
});
type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

/* ========================================================================
                                PAGE
======================================================================== */

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [tab, setTab] = useState<"orders" | "profile">("orders");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  return (
    <section className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
      {/* --------------------------- header --------------------------- */}
      <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-semibold">
          Личный кабинет
        </h1>
        <Link href="/order">
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-6">
            Создать новый заказ
          </Button>
        </Link>
      </header>

      {/* --------------------------- layout --------------------------- */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as any)}
        className="grid gap-6 lg:gap-8 md:grid-cols-[260px_1fr]"
      >
        {/* ---------- sidebar ---------- */}
        <aside className="rounded-xl border bg-white p-4 md:p-5 shadow-sm">
          <h2 className="mb-6 text-lg font-medium">Меню</h2>

          <TabsList className="flex flex-col gap-2 p-0">
            {[
              { v: "orders", icon: Package, label: "Мои заказы" },
              { v: "profile", icon: User, label: "Профиль" },
            ].map(({ v, icon: Icon, label }) => (
              <TabsTrigger
                key={v}
                value={v}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2.5
                           data-[state=active]:bg-blue-50 data-[state=active]:text-secondary"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </TabsTrigger>
            ))}

            <Button
              variant="ghost"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              className="mt-3 flex w-full items-center gap-3 rounded-md
                         px-3 py-2.5 text-muted-foreground
                         hover:bg-gray-50 hover:text-secondary"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {logoutMutation.isPending ? "Выход…" : "Выйти"}
            </Button>
          </TabsList>
        </aside>

        {/* ---------- main card ---------- */}
        <section className="mt-4 rounded-xl border bg-white p-5 md:p-6 shadow-sm">
          <TabsContent value="orders" forceMount hidden={tab !== "orders"}>
            <Orders orders={orders} isLoading={isLoading} />
          </TabsContent>

          <TabsContent
            value="profile"
            forceMount
            hidden={tab !== "profile"}
          >
            <UserProfile user={user} />
          </TabsContent>
        </section>
      </Tabs>
    </section>
  );
}

/* ========================================================================
                              CHILDREN
======================================================================== */

function Orders({
  orders,
  isLoading,
}: {
  orders?: Order[];
  isLoading: boolean;
}) {
  if (isLoading) return <Spinner />;

  if (!orders?.length)
    return (
      <Empty
        msg="У вас пока нет заказов."
        link={{ to: "/order", label: "Оформите ваш первый заказ" }}
      />
    );

  return (
    <>
      <h2 className="mb-6 text-xl sm:text-2xl font-medium">
        История заказов
      </h2>

      <div className="space-y-5">
        {orders.map((o) => {
          const v = (o.vehicle as Vehicle) || {};
          const parts = (o.parts as Part[]) || [];

          return (
            <Card
              key={o.id}
              className="overflow-hidden border-border shadow-sm hover:shadow"
            >
              {/* ----- header (now flex‑wrap) ----- */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-4 sm:px-5 py-3">
                <span className="text-sm text-muted-foreground">
                  Номер заказа: <span className="font-medium">#{o.id}</span>
                </span>

                {statusLabels[o.status] && (
                  <span
                    className={`inline-flex items-center w-auto rounded-full px-2.5 py-1 text-xs font-medium ${statusLabels[o.status].color}`}
                  >
                    {statusLabels[o.status].label}
                  </span>
                )}
              </div>

              {/* ----- body ----- */}
              <CardContent className="p-4 sm:p-5">
                <div className="grid gap-5 mb-4 sm:grid-cols-3">
                  <Info label="Автомобиль">
                    {v.make || "-"} {v.model || ""}, {v.year || "-"}
                    {v.engineVolume && `, ${v.engineVolume}`}
                  </Info>

                  <Info label="Дата заказа">{fmtDate(o.createdAt)}</Info>

                  <Info label="Запчасти">
                    {parts.length
                      ? parts.map((p, i) => (
                          <span key={i}>
                            {p.name || "Неизвестная деталь"} (
                            {p.quantity || 1} шт.)
                            {i < parts.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "Нет информации"}
                  </Info>
                </div>

                <button className="mt-2 flex items-center text-sm text-secondary hover:text-secondary/80">
                  Подробнее <ChevronRight className="ml-1.5 h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* --------------------------- profile --------------------------- */

const UserProfile: React.FC<{ user: SelectUser | null }> = ({
  user,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      countryCode: "+7",
      city: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        phone: user.phone || "",
        countryCode: user.countryCode || "+7",
        city: user.city || "",
      });
    }
  }, [user, isEditing, form]);

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileFormValues) => {
      const payload = {
        ...data,
        phone: data.phone || null,
        city: data.city || null,
        fullName: data.fullName || null,
        countryCode: data.countryCode || "+7",
      };
      const res = await apiRequest(
        "PATCH",
        "/api/user/profile",
        payload
      );
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Ошибка сервера" }));
        throw new Error(err.message || "Unknown error");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (e: Error) =>
      toast({
        title: "Ошибка обновления профиля",
        description: e.message,
        variant: "destructive",
      }),
  });

  if (!user) return <Spinner />;

  return (
    <div>
      <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-medium">
        Данные профиля
      </h2>

      <div className="mb-8 rounded-lg border border-border/50 bg-white/50 p-5 sm:p-6">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <Info label="Имя">{user.fullName || "Не указано"}</Info>
          <Info label="Email">{user.email || "Не указано"}</Info>
          <Info label="Телефон">
            {user.phone
              ? `${user.countryCode || ""} ${user.phone}`
              : "Не указан"}
          </Info>
          <Info label="Город">{user.city || "Не указан"}</Info>
        </div>
      </div>

      <Button
        className="bg-primary hover:bg-primary/90 px-5 py-2.5 text-white"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="mr-2.5 h-4 w-4" />
        Редактировать профиль
      </Button>

      {/* ---------------- dialog ---------------- */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="w-[95%] max-w-md sm:max-w-lg rounded-lg p-5 sm:p-6 shadow-lg">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl sm:text-2xl font-medium">
              Редактирование профиля
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-muted-foreground">
              Обновите свои контактные данные. Нажмите
              «Сохранить» для применения изменений.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) =>
                updateProfile.mutate(d)
              )}
              className="space-y-5 pt-4"
            >
              {/* ---------- fullName ---------- */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ваше полное имя"
                        {...field}
                        value={field.value ?? ""}
                        className="focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ---------- phone ---------- */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field: phoneField }) => (
                  <FormItem>
                    <FormLabel>Телефон</FormLabel>
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field: ccField }) => (
                        <FormControl>
                          <PhoneInput
                            value={phoneField.value || ""}
                            onChange={phoneField.onChange}
                            countryCode={ccField.value || "+7"}
                            onCountryCodeChange={ccField.onChange}
                            error={
                              form.formState.errors.phone?.message
                            }
                            className="focus-visible:ring-primary"
                          />
                        </FormControl>
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ---------- city ---------- */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Город</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ваш город"
                        {...field}
                        value={field.value ?? ""}
                        className="focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ---------- footer ---------- */}
              <DialogFooter className="mt-6 flex-col gap-3 pt-4 sm:flex-row sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={updateProfile.isPending}
                  onClick={() => setIsEditing(false)}
                  className="order-2 w-full sm:order-1 sm:w-auto"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={
                    updateProfile.isPending ||
                    !form.formState.isDirty
                  }
                  className="order-1 w-full bg-primary text-white hover:bg-primary/90 sm:order-2 sm:w-auto"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение…
                    </>
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ========================================================================
                              helpers
======================================================================== */

const Spinner = () => (
  <div className="flex h-40 items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Empty = ({
  msg,
  link,
}: {
  msg: string;
  link: { to: string; label: string };
}) => (
  <div className="py-8 text-center">
    <h2 className="mb-6 text-xl font-medium">История заказов</h2>
    <p className="text-muted-foreground">
      {msg}{" "}
      <Link href={link.to} className="text-secondary hover:underline">
        {link.label}
      </Link>
    </p>
  </div>
);

const Info = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
    <p className="text-sm">{children}</p>
  </div>
);
