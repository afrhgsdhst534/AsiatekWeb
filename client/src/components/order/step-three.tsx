// FILE: client/src/components/order/step-three.tsx (Corrected RHF/Submit)
// Replace ENTIRE file content

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, // Keep Form component wrapper for structure
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Part, partSchema as sharedPartSchema } from "@shared/schema"; // Import shared Part schema and type

interface StepThreeProps {
  parts: Part[]; // Receive parts array from parent (OrderForm)
  onBack: () => void;
  onNext: (data: { parts: Part[] }) => void; // Send back the validated parts array
}

// Define the Zod schema for the form data WITHIN this step
const stepThreeFormSchema = z.object({
  // Use the sharedPartSchema for validation within the array
  parts: z.array(sharedPartSchema).min(1, "Добавьте хотя бы одну запчасть"),
});

// Type for the form values managed by this step's useForm instance
type StepThreeFormValues = z.infer<typeof stepThreeFormSchema>;

const StepThree: React.FC<StepThreeProps> = ({ parts, onBack, onNext }) => {
  // Initialize useForm for THIS step's validation
  const form = useForm<StepThreeFormValues>({
    resolver: zodResolver(stepThreeFormSchema),
    defaultValues: {
      // Initialize with data passed from parent
      parts: parts.length > 0 ? parts : [{ name: "", quantity: 1 }], // Ensure at least one row
    },
    mode: "onBlur", // Validate on blur
  });

  // useFieldArray links to this step's form instance
  const { fields, append, remove } = useFieldArray({
    name: "parts",
    control: form.control,
  });

  // Function to handle form submission for THIS step
  const onSubmit = (values: StepThreeFormValues) => {
    console.log("Step 3 Form submitted with values:", values);
    // Pass the validated parts array up to the parent (OrderForm)
    onNext({ parts: values.parts });
  };

  // Add a new, empty part structure
  const addPart = () => {
    append({ name: "", quantity: 1, sku: "", brand: "", description: "" });
  };

  return (
    <div className="step-container">
      <h2 className="text-xl font-medium text-foreground mb-6">
        Список запчастей
      </h2>
      <Form {...form}>
        {/* Use this step's form instance */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-border rounded-md p-4 md:p-6 space-y-4 relative" // Added relative for potential absolute positioning of delete btn
              >
                {/* Delete Button (Positioned top-right on larger screens) */}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Удалить</span>
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Part Name */}
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`parts.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название запчасти *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Например: Тормозной диск передний"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* SKU */}
                  <FormField
                    control={form.control}
                    name={`parts.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Артикул</FormLabel>
                        <FormControl>
                          <Input placeholder="Ориг. номер / SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name={`parts.${index}.quantity`}
                    render={(
                      { field: controllerField }, // Rename field to avoid conflict
                    ) => (
                      <FormItem>
                        <FormLabel>Кол-во *</FormLabel>
                        {/* Use Controller for direct value manipulation */}
                        <Controller
                          control={form.control}
                          name={`parts.${index}.quantity`}
                          render={({ field }) => (
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-r-none"
                                onClick={() =>
                                  field.onChange(
                                    Math.max(1, (field.value || 1) - 1),
                                  )
                                }
                                disabled={field.value <= 1}
                              >
                                -
                              </Button>
                              <FormControl>
                                {/* Ensure input type is number, handle string conversion */}
                                <Input
                                  type="number"
                                  className="rounded-none text-center w-16 h-9 px-1"
                                  min={1}
                                  {...field}
                                  value={field.value || 1} // Ensure value is controlled
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    field.onChange(
                                      isNaN(value) || value < 1 ? 1 : value,
                                    );
                                  }}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-l-none"
                                onClick={() =>
                                  field.onChange((field.value || 0) + 1)
                                }
                              >
                                +
                              </Button>
                            </div>
                          )}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Brand */}
                <FormField
                  control={form.control}
                  name={`parts.${index}.brand`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Бренд</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Напр. Bosch, TRW (если важно)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description / Comment */}
                <FormField
                  control={form.control}
                  name={`parts.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Комментарий</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Доп. информация, сторона установки и т.д."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          {/* Add Part Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto flex items-center justify-center"
            onClick={addPart}
          >
            <Plus className="w-5 h-5 mr-2" />
            Добавить еще запчасть
          </Button>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Назад
            </Button>
            <Button type="submit">
              {" "}
              {/* Submit triggers this step's validation */}
              Продолжить
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
export default StepThree;
