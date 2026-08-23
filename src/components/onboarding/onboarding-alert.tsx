import { InlineError } from "@/components/ui/error-state";

type OnboardingAlertProps = {
  message: string;
};

export function OnboardingAlert({ message }: OnboardingAlertProps) {
  return <InlineError message={message} />;
}
