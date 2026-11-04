import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { UsagePanel } from "./UsagePanel";

test("renders remaining requests and tokens per model", () => {
  render(
    <UsagePanel
      usage={{
        chat: {
          limit_requests: 1000,
          remaining_requests: 990,
          limit_tokens: 100000,
          remaining_tokens: 99000,
          reset_requests: "2m",
          observed_at: 1,
        },
        whisper: {
          limit_requests: 2000,
          remaining_requests: 1999,
          limit_audio_seconds: 28800,
          remaining_audio_seconds: 28000,
          observed_at: 1,
        },
      }}
    />,
  );
  expect(screen.getByText("990 / 1000 requests")).toBeInTheDocument();
  expect(screen.getByText("99000 / 100000 tokens")).toBeInTheDocument();
  expect(screen.getByText("28000 / 28800 audio s")).toBeInTheDocument();
  expect(screen.getByText("resets in 2m")).toBeInTheDocument();
});
