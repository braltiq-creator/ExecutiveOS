import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Dropdown",
  component: Dropdown,
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dropdown
      trigger={<Button variant="secondary" size="sm">Account</Button>}
      items={[
        { id: "org", label: "Organisation", href: "/organization" },
        { id: "billing", label: "Billing", href: "/settings/billing" },
        { id: "signout", label: "Sign out", onSelect: () => undefined },
      ]}
    />
  ),
};
