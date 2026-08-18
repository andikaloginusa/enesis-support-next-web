import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userService } from "@services/user.service";
import { userProfileFormSchema } from "@types/user.schema";
import { useState } from "react";
import { queryKeys } from "@/lib/queryKeys";

/**
 * useUserProfile — Custom Hook for User Profile Page
 *
 * Manages user profile fetching, form state (via React Hook Form + Zod),
 * and profile update mutation.
 *
 * Updated to use:
 * - `queryKeys.user.profile(userId)` for centralized cache key management
 * - `userService` backed by real API (no longer mock)
 *
 * @param {string} userId - The user's unique identifier
 */
export const useUserProfile = (userId) => {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch user profile data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: async () => {
      const response = await userService.getUserProfile(userId);
      if (response?.ok && response?.data) {
        return response.data.result || response.data;
      }
      throw new Error(response?.data?.message || "Failed to load user profile");
    },
    enabled: !!userId,
  });

  // Form setup via React Hook Form + Zod validation
  const form = useForm({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      bio: "",
    },
    values: data, // Automatically updates form when data is loaded
  });

  // Profile update mutation
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const response = await userService.updateUserProfile(userId, formData);
      if (!response?.ok) {
        throw new Error(response?.data?.message || "Gagal memperbarui profil");
      }
      return response.data?.result || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(userId) });
      setSuccessMessage("Profile updated successfully!");
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    },
  });

  const onSubmit = form.handleSubmit((formData) => {
    setSuccessMessage("");
    mutation.mutate(formData);
  });

  const onReset = () => {
    form.reset();
    setSuccessMessage("");
  };

  return {
    data,
    isLoading,
    isError,
    error,
    form,
    isMutating: mutation.isPending,
    mutationError: mutation.error,
    successMessage,
    onSubmit,
    onReset,
  };
};
