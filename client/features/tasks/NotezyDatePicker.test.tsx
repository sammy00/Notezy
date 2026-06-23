import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NotezyDatePicker } from "./NotezyDatePicker";

describe("NotezyDatePicker", () => {
  it("opens the calendar and clears the selected date", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<NotezyDatePicker value="2026-06-23" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Jun 23, 2026/i }));
    expect(screen.getByRole("dialog", { name: "Choose due date" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear date" }));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
