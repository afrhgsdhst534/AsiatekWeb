// FILE: client/src/components/order/step-four.tsx (Applying friend's structure)
// Replace ENTIRE file content

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import PhoneInput from "@/components/ui/phone-input"; // Import the modified component
import { PasswordInput } from "@/components/ui/password-input";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { stepFourContactSchema, StepFourFormData } from "@shared/schema";
import { CombinedFormData } from "./order-form";

interface StepFourProps {
  onBack: () => void;
  onSubmit: (data: StepFourFormData) => void;
  isLoading: boolean;
}

const StepFour: React.FC<StepFourProps> = ({ onBack, onSubmit, isLoading }) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const form = useFormContext<CombinedFormData>();
  const watchCreateAccount = form.watch("createAccount");

  const handleStepFourButtonClick = () => {
    const stepData: StepFourFormData = {
      name: form.getValues("name"),
      email: form.getValues("email"),
      phone: form.getValues("phone"),
      countryCode: form.getValues("countryCode"),
      city: form.getValues("city"),
      comments: form.getValues("comments"),
      createAccount: form.getValues("createAccount"),
      password: form.getValues("password"),
      passwordConfirm: form.getValues("passwordConfirm"),
    };
    const dataToSubmit = isLoggedIn
      ? { ...stepData, createAccount: false, password: "", passwordConfirm: "" }
      : stepData;
    console.log(
      "StepFour button clicked, calling parent onSubmit with:",
      dataToSubmit,
    );
    onSubmit(dataToSubmit);
  };

  return (
    <div className="step-container">
      <h2 className="mb-6 text-xl font-medium text-foreground">
        Контактная информация{" "}
        {isLoggedIn && (
          <span className="text-sm text-muted-foreground">
            (используются данные профиля)
          </span>
        )}
      </h2>
      <div className="space-y-6">
        {/* Name / Email - unchanged */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ваше имя"
                    {...field}
                    disabled={isLoggedIn}
                  />
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
                <FormLabel>
                  Email {!isLoggedIn && watchCreateAccount ? "*" : ""}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ваш email"
                    type="email"
                    {...field}
                    disabled={isLoggedIn}
                  />
                </FormControl>
                <FormDescription className={isLoggedIn ? "hidden" : ""}>
                  {!watchCreateAccount
                    ? "Укажите, если хотите получать уведомления о заказе."
                    : "Необходим для создания аккаунта."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Phone / City --- */}
        {/* --- REMOVED md:items-end --- */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* --- Phone --- */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                {/* Standard label now sits here */}
                <FormLabel>Телефон *</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value} // Pass value from RHF field
                    onChange={field.onChange} // Pass onChange from RHF field
                    countryCode={form.watch("countryCode")}
                    onCountryCodeChange={(cc) =>
                      form.setValue("countryCode", cc, { shouldValidate: true })
                    }
                    disabled={isLoggedIn}
                    suppressChrome // NEW → hide PhoneInput’s built-in label/helper
                    // Pass error state based on RHF errors for phone OR countryCode
                    error={
                      form.formState.errors.phone?.message ||
                      form.formState.errors.countryCode?.message
                    }
                  />
                </FormControl>
                {/* Helper text and/or format hint – optional */}
                <FormDescription>Формат: XXX XXX XX XX</FormDescription>
                {/* RHF handles displaying errors */}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- City --- */}
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
                    disabled={isLoggedIn}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* --- END PHONE / CITY GRID --- */}

        {/* Comments - unchanged */}
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Комментарий к заказу</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Дополнительная информация (не обязательно)"
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Optional Account Creation - unchanged */}
        {!isLoggedIn && (
          <div className="pt-4 space-y-4">
            <FormField
              control={form.control}
              name="createAccount"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="createAccountCheckbox"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="createAccountCheckbox"
                      className="cursor-pointer"
                    >
                      Создать аккаунт (не обязательно)
                    </Label>
                    <FormDescription>
                      Позволит отслеживать заказы и сохранит ваши данные.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {watchCreateAccount && (
              <div className="space-y-6 p-4 border rounded-md shadow-inner mt-4 bg-muted/20">
                <h3 className="text-base font-medium text-foreground">
                  Установите пароль для нового аккаунта
                </h3>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль *</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Минимум 6 символов"
                          autoComplete="new-password"
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
                      <FormLabel>Подтверждение пароля *</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Повторите пароль"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Root Error Display - unchanged */}
        {form.formState.errors.root?.message && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons - unchanged */}
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Назад
          </Button>
          <Button
            type="button"
            onClick={handleStepFourButtonClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Отправка...
              </>
            ) : (
              "Отправить заказ"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepFour;
