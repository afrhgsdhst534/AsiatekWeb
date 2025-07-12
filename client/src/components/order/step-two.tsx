import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vehicle } from "@shared/schema"; // Import the main Vehicle type
import { cn } from "@/lib/utils";

interface StepTwoProps {
  vehicle: Partial<Vehicle>; // Receive the current vehicle data from parent
  onBack: () => void;
  onNext: (vehicleData: Partial<Omit<Vehicle, "type">>) => void; // Send back only the details updated in this step
}

// Define Zod schema specifically for the data entered in this step
const vinSchema = z.object({
  vin: z.string().length(17, "VIN должен содержать 17 символов"),
  // Manual fields are optional when using VIN
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  engineVolume: z.string().optional(),
  fuelType: z.string().optional(),
});

const manualSchema = z.object({
  vin: z.string().optional(), // VIN is optional when using manual
  make: z.string().min(1, "Марка обязательна"),
  model: z.string().min(1, "Модель обязательна"),
  year: z
    .string()
    .min(4, "Год обязателен (ГГГГ)")
    .max(4, "Год обязателен (ГГГГ)")
    .regex(/^\d{4}$/, "Год должен быть в формате ГГГГ")
    .refine(
      (val) =>
        parseInt(val) >= 1900 && parseInt(val) <= new Date().getFullYear() + 1,
      {
        message: "Некорректный год",
      },
    ),
  engineVolume: z.string().optional(),
  fuelType: z.string().optional(),
});

// Type for the form values in this step
type StepTwoFormValues = z.infer<typeof vinSchema> | z.infer<typeof manualSchema>;

const StepTwo: React.FC<StepTwoProps> = ({ vehicle, onBack, onNext }) => {
  // Default input method is ALWAYS "vin" now
  const [inputMethod, setInputMethod] = useState<"vin" | "manual">("vin");

  // Determine the correct schema based ONLY on input method chosen
  const currentSchema = inputMethod === "vin" ? vinSchema : manualSchema;

  const form = useForm<StepTwoFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      // Populate from parent state regardless of type
      vin: vehicle.vin || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year ? String(vehicle.year) : "", // Convert number to string for input
      engineVolume: vehicle.engineVolume || "",
      fuelType: vehicle.fuelType || "",
    },
    mode: "onBlur", // Validate on blur
  });

  // Reset form validation and defaults when input method changes OR parent vehicle data changes
  useEffect(() => {
    form.reset({
      vin: vehicle.vin || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year ? String(vehicle.year) : "",
      engineVolume: vehicle.engineVolume || "",
      fuelType: vehicle.fuelType || "",
    });
  }, [inputMethod, vehicle, form]);

  // This function is called AFTER successful validation by handleSubmit
  const onSubmit = (values: StepTwoFormValues) => {
    console.log("Step 2 Validation PASSED. onSubmit function reached with values:", values);
    let vehicleDetails: Partial<Omit<Vehicle, "type">> = {};

    // Prepare data based only on the selected input method
    if (inputMethod === "vin") {
      // If VIN method, only send VIN, clear others
      vehicleDetails = {
        vin: values.vin,
        make: undefined, model: undefined, year: undefined,
        engineVolume: undefined, fuelType: undefined
      };
    } else { // Manual input method
      // If Manual method, send manual fields, clear VIN
      vehicleDetails = {
        vin: undefined,
        make: values.make,
        model: values.model,
        year: values.year && /^\d{4}$/.test(values.year) ? parseInt(values.year) : undefined,
        engineVolume: values.engineVolume,
        fuelType: values.fuelType,
      };
    }

    console.log("Step 2 calling onNext prop with:", vehicleDetails);
    onNext(vehicleDetails); // Call the parent handler with processed data
  };

  // Log validation errors
  const onInvalid = (errors: any) => {
    console.error("Step 2 Validation FAILED:", errors);
  };

  return (
    <div className="step-container">
      <h2 className="text-xl font-medium text-foreground mb-6">
        Информация о транспортном средстве ({/* Display vehicle type from props */}
        {vehicle.type === "passenger" ? "Легковой" :
         vehicle.type === "commercial" ? "Коммерческий" :
         vehicle.type === "chinese" ? "Китайский" : ""}
        )
      </h2>

      {/* Always show VIN/Manual switch buttons */}
      <div className="flex mb-6 space-x-4">
        <Button
          type="button"
          variant={inputMethod === "vin" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setInputMethod("vin")}
        >
          По VIN
        </Button>
        <Button
          type="button"
          variant={inputMethod === "manual" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setInputMethod("manual")}
        >
          Вручную
        </Button>
      </div>

      <Form {...form}>
        {/* Pass BOTH handlers to form.handleSubmit */}
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          {/* VIN Input Section - Show ONLY if inputMethod is 'vin' */}
          {inputMethod === "vin" && (
            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN номер *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите 17-значный VIN"
                      maxLength={17}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())} // Force uppercase
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-sm">
                    17 символов, указан в СТС/ПТС.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Manual Input Section - Show ONLY if inputMethod is 'manual' */}
          {inputMethod === "manual" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Марка *</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota, BMW, Chery..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Модель *</FormLabel>
                      <FormControl>
                        <Input placeholder="Camry, X5, Tiggo..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Год *</FormLabel>
                      <FormControl>
                        <Input placeholder="ГГГГ (напр. 2022)" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engineVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Объем двигателя</FormLabel>
                      <FormControl>
                        <Input placeholder="Напр. 2.0, 3.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип топлива</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="petrol">Бензин</SelectItem>
                          <SelectItem value="diesel">Дизель</SelectItem>
                          <SelectItem value="gas">Газ</SelectItem>
                          <SelectItem value="hybrid">Гибрид</SelectItem>
                          <SelectItem value="electric">Электро</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Назад
            </Button>
            <Button type="submit">
              Продолжить
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StepTwo;