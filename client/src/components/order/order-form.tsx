// FILE: client/src/components/order/order-form.tsx (Add Logging in onSuccess)
// Replace ENTIRE file content

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "./progress-bar";
import StepOne from "./step-one";
import StepTwo from "./step-two";
import StepThree from "./step-three";
import StepFour from "./step-four";
import SuccessModal from "./success-modal";
import { useAuth } from "@/hooks/use-auth";
import {
  Vehicle,
  Part,
  StepFourFormData,
  ContactInfo,
  vehicleSchema as sharedVehicleSchema,
  partSchema as sharedPartSchema,
  User,
} from "@shared/schema";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { apiRequest } from "@/lib/queryClient"; // Assuming apiRequest handles fetch, keep queryClient separate
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// --- Define the Zod schema for the ENTIRE form (Explicit Structure) ---
const combinedOrderSchema = z
  .object({
    vehicle: sharedVehicleSchema.partial().optional(),
    parts: z.array(sharedPartSchema).min(1, "Добавьте хотя бы одну запчасть"),
    name: z.string().min(1, "Имя обязательно"),
    email: z
      .string()
      .email("Неверный формат email")
      .optional()
      .or(z.literal("")),
    phone: z.string().min(10, "Телефон обязателен"),
    countryCode: z.string().min(1, "Код страны обязателен"),
    city: z.string().optional().or(z.literal("")),
    comments: z.string().optional(),
    createAccount: z.boolean().default(false),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.createAccount) {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email обязателен для создания аккаунта",
          path: ["email"],
        });
      }
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Пароль должен быть не менее 6 символов",
          path: ["password"],
        });
      }
      if (data.password !== data.passwordConfirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Пароли не совпадают",
          path: ["passwordConfirm"],
        });
      }
    }
  });

export type CombinedFormData = z.infer<typeof combinedOrderSchema>;

// --- The Main OrderForm Component ---
const OrderForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { toast } = useToast();
  const { user, checkAuth } = useAuth();
  const [, navigate] = useLocation();
  const isLoggedIn = !!user;
  const queryClient = useQueryClient(); // Get query client instance via hook

  const formMethods = useForm<CombinedFormData>({
    resolver: zodResolver(combinedOrderSchema),
    defaultValues: {
      /* ... same defaults ... */
      vehicle: {
        type: "passenger",
        vin: "",
        make: "",
        model: "",
        year: undefined,
        engineVolume: "",
        fuelType: "",
      },
      parts: [{ name: "", quantity: 1, sku: "", brand: "", description: "" }],
      name: "",
      email: "",
      phone: "",
      countryCode: "+7",
      city: "",
      comments: "",
      createAccount: false,
      password: "",
      passwordConfirm: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    /* ... same effect ... */
    if (isLoggedIn && user) {
      const typedUser = user as User;
      formMethods.reset({
        ...formMethods.getValues(),
        name: typedUser.fullName || "",
        email: typedUser.email || "",
        phone: typedUser.phone || "",
        countryCode: typedUser.countryCode || "+7",
        city: typedUser.city || "",
        createAccount: false,
        password: "",
        passwordConfirm: "",
      });
    }
  }, [isLoggedIn, user, formMethods]);

  const submitOrderMutation = useMutation({
    mutationFn: async (payload: CombinedFormData) => {
      /* ... same mutationFn ... */
      const apiEndpoint = isLoggedIn ? "/api/orders" : "/api/guest-order";
      const contactInfoPayload: ContactInfo = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        countryCode: payload.countryCode,
        city: payload.city,
        comments: payload.comments,
      };
      let apiPayload: any = {
        vehicle: payload.vehicle,
        parts: payload.parts,
        contactInfo: contactInfoPayload,
      };
      if (!isLoggedIn) {
        apiPayload.createAccount = payload.createAccount;
        if (payload.createAccount && payload.password) {
          apiPayload.password = payload.password;
        }
      }
      console.log(`Submitting to ${apiEndpoint}:`, apiPayload);
      // Ensure apiRequest is correctly defined elsewhere to handle fetch
      const res = await apiRequest("POST", apiEndpoint, apiPayload);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: `Ошибка сервера (${res.status})` }));
        console.error("API Error Response:", errorData);
        if (res.status === 409 && errorData.field === "email") {
          formMethods.setError("email", {
            type: "manual",
            message: errorData.message,
          });
        }
        throw new Error(
          errorData.message || `Ошибка при отправке заказа (${res.status})`,
        );
      }
      return await res.json();
    },
    onSuccess: async (data) => {
      console.log("Order Success Response:", data);
      console.log("onSuccess: Setting success modal open...");
      try {
        setIsSuccessModalOpen(true);
        console.log("onSuccess: Success modal state set.");

        if (
          data?.user &&
          !isLoggedIn &&
          data?.message?.toLowerCase().includes("created")
        ) {
          console.log("onSuccess: Handling user creation path...");
          toast({
            title: "Аккаунт создан",
            description: "Мы создали аккаунт для вас.",
          });
          console.log("onSuccess: Invalidate user query...");
          await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          console.log(
            "onSuccess: User query invalidated. Calling checkAuth...",
          );
          // Ensure checkAuth is a function before calling
          if (typeof checkAuth === "function") {
            await checkAuth();
            console.log("onSuccess: checkAuth completed.");
          } else {
            console.warn(
              "onSuccess: checkAuth is not a function, skipping call.",
            );
          }
        } else {
          console.log("onSuccess: Handling guest/logged-in success path...");
          toast({
            title: "Заказ отправлен!",
            description: "Спасибо за ваш заказ.",
          });
          console.log("onSuccess: Guest/logged-in toast shown.");
        }

        console.log("onSuccess: Invalidate orders query...");
        await queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        console.log("onSuccess: Orders query invalidated. Handler finished.");
      } catch (error) {
        // Catch errors specifically within the onSuccess block
        console.error("Error INSIDE onSuccess handler:", error);
        // Optionally re-throw or handle differently
        toast({
          title: "Ошибка после успешной отправки",
          description:
            error instanceof Error
              ? error.message
              : "Произошла внутренняя ошибка.",
          variant: "destructive",
        });
        // We might NOT want this error to trigger the mutation's main onError handler
        // depending on desired behavior, but for now, let's log it clearly.
      }
    },
    onError: (error: Error) => {
      // This catches errors from mutationFn OR unhandled errors from onSuccess
      console.error("Mutation onError handler:", error);
      toast({
        title: "Ошибка при отправке заказа",
        description: error.message || "Не удалось отправить заказ.", // Display the actual error message caught
        variant: "destructive",
      });
    },
  });

  // --- Rest of the component (goBack, step handlers, render logic) remains the same ---
  const goBack = () => currentStep > 1 && setCurrentStep((s) => s - 1);

  const handleStepOneSubmit = (vehicleType: Vehicle["type"]) => {
    formMethods.setValue("vehicle.type", vehicleType, {
      shouldValidate: false,
    });
    setCurrentStep(2);
  };

  const handleStepTwoSubmit = (stepTwoData: Partial<Omit<Vehicle, "type">>) => {
    const currentVehicle = formMethods.getValues("vehicle") || {
      type: "passenger",
    };
    formMethods.setValue("vehicle", { ...currentVehicle, ...stepTwoData }); // No immediate validation
    console.log(
      "Step 2 Updated RHF Vehicle State:",
      formMethods.getValues("vehicle"),
    );
    setCurrentStep(3);
  };

  const handleStepThreeSubmit = (stepThreeData: { parts: Part[] }) => {
    formMethods.setValue("parts", stepThreeData.parts); // No immediate validation
    console.log(
      "Step 3 Updated RHF Parts State:",
      formMethods.getValues("parts"),
    );
    setCurrentStep(4);
  };

  const handleStepFourSubmit = (stepFourData: StepFourFormData) => {
    console.log("Step 4 Data Received in OrderForm:", stepFourData);
    formMethods.handleSubmit(
      (fullFormData) => {
        console.log(
          "Final Validated Submit Data (Restructured Schema):",
          fullFormData,
        );
        submitOrderMutation.mutate(fullFormData);
      },
      (errors: FieldErrors<CombinedFormData>) => {
        console.error(
          "Final Form Validation Errors (Restructured Schema):",
          errors,
        );
        let errorMsg = "Пожалуйста, проверьте введенные данные.";
        if (errors.vehicle && Object.keys(errors.vehicle).length > 0)
          errorMsg = "Проверьте данные об автомобиле (Шаг 2).";
        else if (
          errors.parts &&
          (Array.isArray(errors.parts)
            ? errors.parts.length > 0
            : errors.parts.message)
        )
          errorMsg = "Проверьте данные о запчастях (Шаг 3).";
        else if (
          errors.name ||
          errors.email ||
          errors.phone ||
          errors.countryCode ||
          errors.password ||
          errors.passwordConfirm
        )
          errorMsg = "Проверьте контактную информацию или пароль (Шаг 4).";
        toast({
          title: "Ошибка валидации",
          description: errorMsg,
          variant: "destructive",
        });
      },
    )();
  };

  const renderCurrentStep = () => {
    const currentVehicleData = formMethods.watch("vehicle");
    const currentPartsData = formMethods.watch("parts");
    switch (currentStep) {
      case 1:
        return <StepOne onNext={handleStepOneSubmit} />;
      case 2:
        return (
          <StepTwo
            vehicle={currentVehicleData || {}}
            onBack={goBack}
            onNext={handleStepTwoSubmit}
          />
        );
      case 3:
        return (
          <StepThree
            parts={currentPartsData || []}
            onBack={goBack}
            onNext={handleStepThreeSubmit}
          />
        );
      case 4:
        return (
          <StepFour
            onBack={goBack}
            onSubmit={handleStepFourSubmit}
            isLoading={submitOrderMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            Оформление заказа
          </h1>
        </div>
        <ProgressBar currentStep={currentStep} totalSteps={4} />
        <FormProvider {...formMethods}>
          <div className="mt-8">{renderCurrentStep()}</div>
        </FormProvider>
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false);
            formMethods.reset();
            setCurrentStep(1);
            navigate(
              isLoggedIn || submitOrderMutation.data?.user ? "/dashboard" : "/",
            );
          }}
        />
      </div>
    </div>
  );
};

export default OrderForm;
export type { CombinedFormData };
