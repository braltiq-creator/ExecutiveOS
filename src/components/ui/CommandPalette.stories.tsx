import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CommandPalette,
  openCommandPalette,
} from "@/components/ui/command-palette";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/CommandPalette",
  component: CommandPalette,
  parameters: {
    docs: {
      description: {
        component:
          "Global ⌘K / Ctrl+K navigation palette over PRIMARY_NAV and UTILITY_NAV. Uses Storybook mocks for next/link and next/navigation.",
      },
    },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="space-y-3">
      <Button size="sm" onClick={() => openCommandPalette()}>
        Open command palette
      </Button>
      <p className="text-sm text-secondary">
        Or press ⌘K / Ctrl+K while focused in the preview.
      </p>
      <CommandPalette />
    </div>
  ),
};
