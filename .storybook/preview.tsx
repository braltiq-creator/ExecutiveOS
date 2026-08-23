import type { Preview } from "@storybook/react-vite";
import "../src/app/globals.css";
import "./storybook.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
    a11y: {
      test: "todo",
    },
    backgrounds: {
      default: "canvas",
      values: [
        { name: "canvas", value: "#12141c" },
        { name: "surface", value: "#1a1f2e" },
        { name: "briefing", value: "#fff1e5" },
      ],
    },
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story) => (
      <div
        data-theme="dark"
        className="min-h-[50vh] bg-canvas font-sans text-foreground antialiased"
      >
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default preview;
