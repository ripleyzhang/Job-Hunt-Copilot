import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Home from "./page";

describe("Home", () => {
  test("renders project navigation", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: "Application Tracker" }),
    ).toHaveAttribute("href", "/application-tracker");
    expect(screen.getByRole("link", { name: "Resume Builder" })).toHaveAttribute(
      "href",
      "/resumes",
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "Ningjing Zhang",
    );
  });
});
