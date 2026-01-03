import {useState} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {authService} from "@/lib/auth";
import {loginSchema, LoginFormData} from "@/lib/validators/auth";

interface UseLoginResult {
  isLoading: boolean;
  error: string | null;
  form: ReturnType<typeof useForm<LoginFormData>>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  clearError: () => void;
}

export const useLogin = (): UseLoginResult => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await authService.login(data.email, data.password);

      if (success) {
        // Handle remember me if needed
        if (data.rememberMe) {
          // You could implement persistent sessions here
          localStorage.setItem("remember_me", "true");
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      console.error("Login error:", err);
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
