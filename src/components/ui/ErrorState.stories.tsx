import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorState, InlineError } from "@/components/ui/error-state";

const meta = {
  title: "UI/ErrorState",
  component: ErrorState,
  args: {
    message: "Unable to load Outcome Health.",
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithRetry: Story = {
  args: {
    onRetry: () => undefined,
  },
};
export const Inline: Story = {
  render: () => <InlineError message="Sync failed for calendar context." />,
};
