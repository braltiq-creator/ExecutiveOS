import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Modal",
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button size="sm" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm deferral"
          description="Deferring moves cost of delay into next week."
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Defer
              </Button>
            </>
          }
        >
          <p className="text-sm text-secondary">
            Linked outcomes will remain at risk until commercial terms are decided.
          </p>
        </Modal>
      </>
    );
  },
};
