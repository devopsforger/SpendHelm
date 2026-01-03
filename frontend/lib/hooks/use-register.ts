import {useState} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {authService} from "@/lib/auth";
import {registerSchema, RegisterFormData} from "@/lib/validators/auth";

interface UseRegisterResult {
  isLoading: boolean;
  error: string | null;
  form: ReturnType<typeof useForm<RegisterFormData>>;
  onSubmit: (data: RegisterFormData) => Promise<void>;
  clearError: () => void;
}

export const useRegister = (): UseRegisterResult => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await authService.register(data.email, data.password);

      if (success) {
        router.push("/dashboard");
        router.refresh(); // Refresh server components if any
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    form,
    onSubmit,
    clearError,
  };
};
