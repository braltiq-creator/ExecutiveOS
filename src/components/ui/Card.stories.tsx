import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Surface container using EOS card tokens (border, surface, radius).",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Priority decision</CardTitle>
        <CardDescription>Approve Helix commercial terms</CardDescription>
      </CardHeader>
      <CardContent>
        Expected outcome impact remains material if deferred past Friday.
      </CardContent>
      <CardFooter>
        <Button size="sm">Open decision</Button>
      </CardFooter>
    </Card>
  ),
};
