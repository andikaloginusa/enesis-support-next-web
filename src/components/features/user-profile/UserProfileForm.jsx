import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Button,
} from "@components/ui";
import { Save, RefreshCw, CheckCircle2 } from "lucide-react";

export const UserProfileForm = ({ profileHook }) => {
  const {
    form,
    isMutating,
    successMessage,
    mutationError,
    onSubmit,
    onReset,
  } = profileHook;

  const {
    register,
    formState: { errors, isDirty },
  } = form;

  return (
    <Card className="w-full">
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your professional information and internal support portal role.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {successMessage && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mutationError && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 p-3 rounded-lg text-sm">
              Failed to update profile: {mutationError.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Full Name"
              placeholder="e.g. Ahmad Reza"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="e.g. name@company.internal"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <Input
            id="role"
            label="Job Role & Persona"
            placeholder="e.g. IT Lead & Senior Architect"
            error={errors.role?.message}
            {...register("role")}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="bio"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Biography / Architectural Focus
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 resize-none"
              placeholder="Briefly describe your responsibilities and active tech stack focus..."
              {...register("bio")}
            />
            {errors.bio && (
              <span className="text-xs text-rose-500 mt-0.5">
                {errors.bio.message}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/50 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            disabled={isMutating}
            className="gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isMutating}
            disabled={!isDirty && !successMessage}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
