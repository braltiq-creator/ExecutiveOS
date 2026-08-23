import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetricCard } from "@/components/ui/metric-card";

const meta = {
  title: "UI/MetricCard",
  component: MetricCard,
  args: {
    label: "Outcome Health",
    value: 68,
    hint: "Portfolio score",
    trend: "−3 vs yesterday",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Metric presentation card. Currently uses legacy zinc text colors (D1).",
      },
    },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
