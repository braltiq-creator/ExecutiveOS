import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton, SkeletonCard, SkeletonGrid } from "@/components/ui/skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};
export const Card: Story = {
  render: () => <SkeletonCard />,
};
export const Grid: Story = {
  render: () => <SkeletonGrid count={3} />,
};
