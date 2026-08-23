import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "@/components/ui/status-badge";

const meta = {
  title: "UI/StatusBadge",
  component: StatusBadge,
  args: { label: "On track", variant: "success" },
  parameters: {
    docs: {
      description: {
        component:
          "Semantic status wrapper over Badge. Use mapHealthStatusToVariant for domain status strings.",
      },
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const Warning: Story = { args: { label: "At risk", variant: "warning" } };
export const Danger: Story = { args: { label: "Off track", variant: "danger" } };
export const Info: Story = { args: { label: "Draft", variant: "info" } };
export const Neutral: Story = { args: { label: "Watching", variant: "neutral" } };
