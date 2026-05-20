import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui";
import { User, Mail, Briefcase, FileText } from "lucide-react";
import Image from "next/image";

export const UserProfileCard = ({ user, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full relative overflow-hidden">
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <CardHeader className="flex flex-row items-center gap-5 pt-8">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-950/50 shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-indigo-50 dark:ring-indigo-950/50 shadow-md">
            {user.name?.charAt(0)}
          </div>
        )}
        <div className="flex flex-col gap-1 flex-1">
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
            <Briefcase className="w-4 h-4" />
            {user.role}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>

        {user.bio && (
          <div className="flex flex-col gap-1.5 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Biography</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {user.bio}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
