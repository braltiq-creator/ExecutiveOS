import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/PageHeader",
  component: PageHeader,
  args: {
    overline: "Today",
    title: "Executive Briefing",
    description: "What requires judgment, why, and what should happen next.",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActions: Story = {
  args: {
    actions: <Button size="sm">Board Mode</Button>,
  },
};
