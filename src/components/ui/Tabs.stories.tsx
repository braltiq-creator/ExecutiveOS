import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs, TabPanel } from "@/components/ui/tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState("queue");
    return (
      <div className="space-y-4">
        <Tabs
          tabs={[
            { id: "queue", label: "Queue", count: 4 },
            { id: "decided", label: "Decided", count: 12 },
          ]}
          activeTab={active}
          onChange={setActive}
        />
        <TabPanel id="queue" activeTab={active}>
          Active decision queue
        </TabPanel>
        <TabPanel id="decided" activeTab={active}>
          Recently decided
        </TabPanel>
      </div>
    );
  },
};
