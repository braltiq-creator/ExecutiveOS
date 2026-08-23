import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/SectionHeader",
  component: SectionHeader,
  args: {
    title: "Priority Decisions",
    description: "Judgment required before end of day.",
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: {
    action: <Button size="sm" variant="ghost">View all</Button>,
  },
};
