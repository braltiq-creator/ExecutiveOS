/**
 * OrganizationSetup — create/join loading + navigation (no stuck Creating...).
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OrganizationSetup } from "@/components/organizations/OrganizationSetup";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/organizations/actions", () => ({
  createOrganizationAction: vi.fn(),
  joinByInvitationCodeAction: vi.fn(),
  joinByInvitationIdAction: vi.fn(),
}));

import {
  createOrganizationAction,
  joinByInvitationCodeAction,
} from "@/lib/organizations/actions";

const membershipFixture = {
  organization: {
    id: "org-1",
    name: "Braltiq",
    legal_name: null,
    industry: null,
    company_size: null,
    country: null,
    timezone: "UTC",
    website: null,
    logo_url: null,
    subscription_plan: "free" as const,
    created_by: "user-1",
    archived_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  member: {
    id: "mem-1",
    organization_id: "org-1",
    user_id: "user-1",
    role: "owner" as const,
    status: "active" as const,
    email: "a@example.com",
    display_name: "A",
    joined_at: "2026-01-01T00:00:00.000Z",
    invited_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
  },
};

function getCreateSubmit() {
  const buttons = screen.getAllByRole("button", {
    name: "Create Organization",
  });
  const submit = buttons.find(
    (button) => (button as HTMLButtonElement).type === "submit",
  );
  if (!submit) {
    throw new Error("Create Organization submit button not found");
  }
  return submit;
}

describe("OrganizationSetup create/join UI hang fix", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.mocked(createOrganizationAction).mockReset();
    vi.mocked(joinByInvitationCodeAction).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("successful create calls action, pushes /onboarding, and does not refresh", async () => {
    vi.mocked(createOrganizationAction).mockResolvedValue({
      error: null,
      data: membershipFixture,
    });

    render(<OrganizationSetup pendingInvitations={[]} />);

    fireEvent.change(screen.getByPlaceholderText("Acme Holdings"), {
      target: { value: "Braltiq" },
    });
    fireEvent.click(getCreateSubmit());

    await waitFor(() => {
      expect(createOrganizationAction).toHaveBeenCalledTimes(1);
    });
    expect(createOrganizationAction).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Braltiq", timezone: "UTC" }),
    );

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/onboarding");
    });
    expect(refresh).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(getCreateSubmit()).not.toBeDisabled();
    });
    expect(screen.queryByText("Creating...")).toBeNull();
  });

  it("error result displays the returned error and clears loading", async () => {
    vi.mocked(createOrganizationAction).mockResolvedValue({
      error: "Organization name is required.",
      data: null,
    });

    render(<OrganizationSetup pendingInvitations={[]} />);
    fireEvent.change(screen.getByPlaceholderText("Acme Holdings"), {
      target: { value: "Braltiq" },
    });
    fireEvent.click(getCreateSubmit());

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Organization name is required.",
      );
    });
    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(getCreateSubmit()).not.toBeDisabled();
  });

  it("exception path displays an error and clears loading via finally", async () => {
    vi.mocked(createOrganizationAction).mockRejectedValue(
      new Error("Network failure"),
    );

    render(<OrganizationSetup pendingInvitations={[]} />);
    fireEvent.change(screen.getByPlaceholderText("Acme Holdings"), {
      target: { value: "Braltiq" },
    });
    fireEvent.click(getCreateSubmit());

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network failure");
    });
    expect(push).not.toHaveBeenCalled();
    expect(getCreateSubmit()).not.toBeDisabled();
  });

  it("preserves required name validation (browser required attribute)", () => {
    render(<OrganizationSetup pendingInvitations={[]} />);
    const nameInput = screen.getByPlaceholderText("Acme Holdings");
    expect(nameInput).toBeRequired();
    const timezone = screen.getByDisplayValue("UTC");
    expect(timezone).toBeRequired();
  });

  it("join by code uses the same safe loading/navigation pattern", async () => {
    vi.mocked(joinByInvitationCodeAction).mockResolvedValue({
      error: null,
      data: membershipFixture,
    });

    render(<OrganizationSetup pendingInvitations={[]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Join Existing Organization" }),
    );
    fireEvent.change(screen.getByPlaceholderText("AB12CD34"), {
      target: { value: "AB12CD34" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Join Organization" }));

    await waitFor(() => {
      expect(joinByInvitationCodeAction).toHaveBeenCalledWith({
        invitationCode: "AB12CD34",
      });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/onboarding");
    });
    expect(refresh).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Join Organization" }),
      ).not.toBeDisabled();
    });
  });
});
