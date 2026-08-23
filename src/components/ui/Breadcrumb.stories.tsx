import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const meta = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [
      { label: "Decisions", href: "/decisions" },
      { label: "Approve Helix terms" },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
