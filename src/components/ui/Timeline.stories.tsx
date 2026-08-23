import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timeline } from "@/components/ui/timeline";

const meta = {
  title: "UI/Timeline",
  component: Timeline,
  args: {
    items: [
      {
        id: "1",
        time: "06:40",
        title: "Overnight ARR signal",
        summary: "Pipeline slip against Enterprise ARR outcome.",
        badge: "Attention",
        typeLabel: "Insight",
      },
      {
        id: "2",
        time: "07:15",
        title: "Decision opened",
        summary: "Helix commercial terms entered review.",
        typeLabel: "Decision",
      },
    ],
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { items: [] } };
