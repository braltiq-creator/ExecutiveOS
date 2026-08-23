import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: { children: "At risk" },
  parameters: {
    docs: {
      description: {
        component:
          "Compact status chip. Note: still uses legacy zinc/emerald palettes (see Constitution inconsistencies D1).",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { variant: "success", children: "On track" } };
export const Warning: Story = { args: { variant: "warning", children: "Watch" } };
export const Danger: Story = { args: { variant: "danger", children: "Critical" } };
export const Info: Story = { args: { variant: "info", children: "Info" } };
export const Dark: Story = { args: { variant: "dark", children: "Dark" } };
