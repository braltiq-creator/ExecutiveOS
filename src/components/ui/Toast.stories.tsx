import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

function Demo() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        onClick={() =>
          toast({ title: "Saved", description: "Decision updated.", variant: "success" })
        }
      >
        Success toast
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() =>
          toast({ title: "Failed", description: "Could not sync.", variant: "error" })
        }
      >
        Error toast
      </Button>
    </div>
  );
}

const meta = {
  title: "UI/Toast",
  component: Demo,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
