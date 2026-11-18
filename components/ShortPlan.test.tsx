import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ShortPlan } from "./ShortPlan";

test("raising the fewest shorts above the most lifts the most to match", () => {
  const onChange = vi.fn();
  render(
    <ShortPlan
      value={[{ min_count: 1, max_count: 3, min_seconds: 20, max_seconds: 60 }]}
      onChange={onChange}
    />,
  );
  fireEvent.change(screen.getByLabelText("Fewest shorts"), {
    target: { value: "5" },
  });
  expect(onChange).toHaveBeenCalledWith([
    { min_count: 5, max_count: 5, min_seconds: 20, max_seconds: 60 },
  ]);
});
