import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { UsagePanel } from "./UsagePanel";

test("renders one progress bar with the videos left today", () => {
  render(
    <UsagePanel
      me={{
        email: "a@b.c",
        name: "A",
        used_today: 1,
        limit: 3,
        resets_at: "2026-11-11T00:00:00+00:00",
      }}
    />,
  );
  const bar = screen.getByRole("progressbar");
  expect(bar).toHaveAttribute("aria-valuenow", "67");
  expect(screen.getByText("2 of 3 left")).toBeInTheDocument();
});
