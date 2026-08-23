import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthInput({ label, error, ...props }: AuthInputProps) {
  return <Input label={label} error={error} {...props} />;
}
