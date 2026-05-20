"use client";

import React from "react";
import { useUserProfile } from "@hooks/queries/useUserProfile";
import { UserProfileCard } from "./UserProfileCard";
import { UserProfileForm } from "./UserProfileForm";

export const UserProfileContainer = ({ userId = "user-1" }) => {
  const profileHook = useUserProfile(userId);
  const { data, isLoading, isError, error } = profileHook;

  if (isError) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-800">
        <h3 className="font-bold text-lg mb-1">Failed to load profile</h3>
        <p className="text-sm">{error?.message || "Unknown error occurred."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-6xl mx-auto py-6">
      <div className="w-full lg:w-5/12 flex-shrink-0">
        <UserProfileCard user={data} isLoading={isLoading} />
      </div>
      <div className="w-full lg:w-7/12 flex-1">
        <UserProfileForm profileHook={profileHook} />
      </div>
    </div>
  );
};
