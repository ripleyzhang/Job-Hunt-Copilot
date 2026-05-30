import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

const STORAGE_KEY = "internship-applications-v1";

async function renderTracker() {
  render(<Home />);

  await waitFor(() => {
    expect(screen.getByText("0 of 0 shown")).toBeInTheDocument();
  });
}

async function createApplication({
  company = "OpenAI",
  roleTitle = "Software Engineering Intern",
  techStack = "React, TypeScript",
  status = "Applied",
  resumeVersion = "software-v1",
  notes = "Applied through company website.",
} = {}) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Company"), company);
  await user.type(screen.getByLabelText("Role Title"), roleTitle);
  await user.type(screen.getByLabelText("Required Tech Stack"), techStack);
  await user.selectOptions(screen.getByLabelText("Status"), status);
  await user.type(screen.getByLabelText("Resume Version"), resumeVersion);
  await user.type(screen.getByLabelText("Notes"), notes);

  await user.click(screen.getByRole("button", { name: "Create Application" }));
}

describe("Application Tracker", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  test("creates an application", async () => {
    await renderTracker();

    await createApplication();

    const createdCard = screen
      .getByText("Software Engineering Intern")
      .closest("article");

    expect(createdCard).not.toBeNull();

    const createdCardView = within(createdCard as HTMLElement);

    expect(createdCardView.getByText("OpenAI")).toBeInTheDocument();
    expect(createdCardView.getByText("Applied")).toBeInTheDocument();
    expect(createdCardView.getByText("React")).toBeInTheDocument();
    expect(createdCardView.getByText("TypeScript")).toBeInTheDocument();
    const storedApplications = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "[]",
    );

    expect(storedApplications).toHaveLength(1);
    expect(storedApplications[0]).toMatchObject({
      company: "OpenAI",
      roleTitle: "Software Engineering Intern",
      status: "Applied",
      requiredTechStack: ["React", "TypeScript"],
      resumeVersion: "software-v1",
    });
  });

  test("filters applications by tech stack", async () => {
    const user = userEvent.setup();

    await renderTracker();

    await createApplication({
      company: "OpenAI",
      roleTitle: "Frontend Intern",
      techStack: "React, TypeScript",
    });

    await createApplication({
      company: "TetraMem",
      roleTitle: "Compiler Engineer Intern",
      techStack: "C++, MLIR",
    });

    expect(screen.getByText("2 of 2 shown")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter by Tech"), "React");

    expect(screen.getByText("Frontend Intern")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.queryByText("Compiler Engineer Intern")).not.toBeInTheDocument();
    expect(screen.queryByText("TetraMem")).not.toBeInTheDocument();
    expect(screen.getByText("1 of 2 shown")).toBeInTheDocument();
  });

  test("edits an application", async () => {
    const user = userEvent.setup();

    await renderTracker();

    await createApplication({
      company: "OpenAI",
      roleTitle: "Software Engineering Intern",
      techStack: "React",
    });

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByText("Edit Application")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Company"));
    await user.type(screen.getByLabelText("Company"), "Anthropic");

    await user.clear(screen.getByLabelText("Role Title"));
    await user.type(screen.getByLabelText("Role Title"), "Full Stack Intern");

    await user.clear(screen.getByLabelText("Required Tech Stack"));
    await user.type(screen.getByLabelText("Required Tech Stack"), "Next.js, Python");

    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    const editedCard = screen.getByText("Full Stack Intern").closest("article");

    expect(editedCard).not.toBeNull();

    const editedCardView = within(editedCard as HTMLElement);

    expect(editedCardView.getByText("Anthropic")).toBeInTheDocument();
    expect(editedCardView.getByText("Next.js")).toBeInTheDocument();
    expect(editedCardView.getByText("Python")).toBeInTheDocument();

    expect(screen.queryByText("Software Engineering Intern")).not.toBeInTheDocument();
    expect(screen.queryByText("OpenAI")).not.toBeInTheDocument();

    const storedApplications = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "[]",
    );

    expect(storedApplications).toHaveLength(1);
    expect(storedApplications[0]).toMatchObject({
      company: "Anthropic",
      roleTitle: "Full Stack Intern",
      requiredTechStack: ["Next.js", "Python"],
    });
  });

  test("deletes an application", async () => {
    const user = userEvent.setup();

    await renderTracker();

    await createApplication({
      company: "OpenAI",
      roleTitle: "Software Engineering Intern",
      techStack: "React",
    });

    expect(screen.getByText("Software Engineering Intern")).toBeInTheDocument();
    expect(screen.getByText("1 of 1 shown")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("Software Engineering Intern")).not.toBeInTheDocument();
    expect(screen.queryByText("OpenAI")).not.toBeInTheDocument();
    expect(screen.getByText("0 of 0 shown")).toBeInTheDocument();
    expect(
      screen.getByText("No applications match the current filters."),
    ).toBeInTheDocument();

    const storedApplications = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "[]",
    );

    expect(storedApplications).toHaveLength(0);
  });
});