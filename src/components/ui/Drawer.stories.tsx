import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Drawer",
  component: Drawer,
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button size="sm" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Evidence">
          <p className="text-sm text-secondary">
            Supporting evidence and sources for the active decision.
          </p>
        </Drawer>
      </>
    );
  },
};
