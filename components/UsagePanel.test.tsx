import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { UsagePanel } from "./UsagePanel";

test("renders one progress bar per model with remaining uses", () => {
  render(
    <UsagePanel
      usage={{
        chat: { limit_requests: 1000, remaining_requests: 990, observed_at: 1 },
        whisper: {
          limit_requests: 2000,
          remaining_requests: 500,
          observed_at: 1,
        },
      }}
    />,
  );
  const bars = screen.getAllByRole("progressbar");
  expect(bars).toHaveLength(2);
  expect(bars[0]).toHaveAttribute("aria-valuenow", "99");
  expect(bars[1]).toHaveAttribute("aria-valuenow", "25");
  expect(screen.getByText("990 of 1,000 left")).toBeInTheDocument();
  expect(screen.queryByText(/groq/i)).not.toBeInTheDocument();
});
