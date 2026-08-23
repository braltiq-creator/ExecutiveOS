type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizes = {
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-8 border-[3px]",
};

export function Spinner({ size = "md", label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-current border-r-transparent ${sizes[size]}`}
    />
  );
}
