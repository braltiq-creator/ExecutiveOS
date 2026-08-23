import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LoadingState,
  PageLoadingState,
  InlineLoading,
} from "@/components/ui/loading-state";

const meta = {
  title: "UI/LoadingState",
  component: LoadingState,
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Page: Story = {
  render: () => <PageLoadingState />,
};
export const Inline: Story = {
  render: () => <InlineLoading label="Refreshing briefing…" />,
};
