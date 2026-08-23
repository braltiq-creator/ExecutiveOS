import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  args: {
    title: "No decisions due today",
    description: "When judgment is required, priority decisions appear here.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: {
    action: <Button size="sm">Review queue</Button>,
  },
};
