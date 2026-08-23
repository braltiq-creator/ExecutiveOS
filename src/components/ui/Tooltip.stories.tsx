import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip content="Opens Outcome Engine">
      <Button variant="secondary" size="sm">
        Outcome Health
      </Button>
    </Tooltip>
  ),
};
