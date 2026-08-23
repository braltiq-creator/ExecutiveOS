/** Storybook stand-in for next/navigation. */
export function useRouter() {
  return {
    push: (href: string) => {
      console.info("[storybook] router.push", href);
    },
    replace: (href: string) => {
      console.info("[storybook] router.replace", href);
    },
    prefetch: async () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
  };
}

export function usePathname() {
  return "/";
}

export function useSearchParams() {
  return new URLSearchParams();
}
