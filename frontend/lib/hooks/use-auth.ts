import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {authService} from "@/lib/auth";
import {User} from "@/lib/types/dashboard";

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await authService.isAuthenticated();

        if (!isAuth && requireAuth) {
          router.push("/login");
          return;
        }

        if (isAuth) {
          // Fetch user data from your API
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        }
      } catch (err) {
        setError("Authentication failed");
        console.error("Auth error:", err);
        if (requireAuth) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, router]);

  const logout = async () => {
    try {
      await authService.logout();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
  };
};
