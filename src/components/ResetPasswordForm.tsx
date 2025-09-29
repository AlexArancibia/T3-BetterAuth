import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type ResetPasswordFormValues = { email: string };

export default function ResetPasswordForm({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const form = useForm<ResetPasswordFormValues>({
    defaultValues: {
      email: "",
    },
  });
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    clearErrors();
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError("email", {
        type: "manual",
        message: "Ingresa un correo válido",
      });
      toast.error("Ingresa un correo válido");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/trpc/auth.recoverPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Si el correo existe, recibirás instrucciones.");
      } else {
        toast.error(result.message || "Error al enviar instrucciones");
      }
    } catch {
      toast.error("Error de red o servidor");
    }
    setLoading(false);
  };

  return (
    <>
      <Form {...form}>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-xl font-bold text-center">
            Reestablecer contraseña
          </h2>
          <Controller
            name="email"
            control={control}
            rules={{ required: "Correo requerido" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {errors.email && (
            <div className="text-red-500 text-sm">{errors.email.message}</div>
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-yellow-500 via-orange-400 to-red-400 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform duration-200"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </button>
          <div className="flex justify-center text-sm mt-2">
            <button
              type="button"
              className="text-indigo-600 hover:underline"
              onClick={onLogin}
            >
              Volver a login
            </button>
          </div>
        </form>
      </Form>
    </>
  );
}
