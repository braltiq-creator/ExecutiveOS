import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

const meta = {
  title: "UI/ResponsiveGrid",
  component: ResponsiveGrid,
} satisfies Meta<typeof ResponsiveGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeColumns: Story = {
  render: () => (
    <ResponsiveGrid columns={3}>
      {["A", "B", "C"].map((label) => (
        <Card key={label}>
          <CardTitle>Outcome {label}</CardTitle>
          <CardContent className="mt-2 text-sm text-secondary">
            Health tile
          </CardContent>
        </Card>
      ))}
    </ResponsiveGrid>
  ),
};
