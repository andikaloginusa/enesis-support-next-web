import React from "react";
import { UserProfileContainer } from "@components/features/user-profile";

export const metadata = {
  title: "User Profile | Internal Support Portal",
  description:
    "Update your professional information and internal support portal role.",
};

export default function ProfilePage() {
  return (
    <div className="w-full">
      <h1 className="sr-only">User Profile Management</h1>
      <UserProfileContainer userId="user-1" />
    </div>
  );
}
