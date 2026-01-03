import {UserPreferences, PreferencesFormData} from "@/lib/types/preferences";

export const preferencesService = {
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await fetch("/api/user/preferences", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch user preferences");
    return response.json();
  },

  async updateUserPreferences(
    data: PreferencesFormData
  ): Promise<UserPreferences> {
    const response = await fetch("/api/user/preferences", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update preferences");
    return response.json();
  },
};
