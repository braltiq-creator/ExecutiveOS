import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/table";

const meta = {
  title: "UI/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Decision</TableHeader>
          <TableHeader>Owner</TableHeader>
          <TableHeader>Deadline</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Approve Helix terms</TableCell>
          <TableCell>Alex Morgan</TableCell>
          <TableCell>Today</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Freeze hiring band</TableCell>
          <TableCell>Sam Lee</TableCell>
          <TableCell>Fri</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
