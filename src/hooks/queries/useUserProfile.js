import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userService } from "@services/user.service";
import { userProfileFormSchema } from "@types/user.schema";
import { useEffect, useState } from "react";

export const useUserProfile = (userId) => {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState("");

  // Data fetching via React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => userService.getUserProfile(userId),
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
    values: data, // Automatically updates form values when data is loaded/updated
  });

  // Mutation via React Query
  const mutation = useMutation({
    mutationFn: (formData) => userService.updateUserProfile(userId, formData),
    onSuccess: (updatedData) => {
      // Invalidate cache to ensure subsequent queries get fresh data
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      setSuccessMessage("Profile updated successfully!");
      
      // Clear success message after 3 seconds
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
