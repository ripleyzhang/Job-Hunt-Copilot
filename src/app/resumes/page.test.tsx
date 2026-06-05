import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResumesPage from "./page";
import type { Resume } from "@/lib/resumes-api";

let resumes: Resume[] = [];

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function setupFetchMock() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method || "GET";
      const resumeId = url.match(/\/api\/resumes\/([^/]+)$/)?.[1];

      if (url.endsWith("/api/resumes") && method === "GET") {
        return jsonResponse(resumes);
      }

      if (url.endsWith("/api/resumes") && method === "POST") {
        const payload = JSON.parse(init?.body as string);
        const resume = {
          ...payload,
          id: `resume-${resumes.length + 1}`,
          createdAt: "2026-06-05T10:00:00Z",
          updatedAt: "2026-06-05T10:00:00Z",
        };

        resumes = [resume, ...resumes];

        return jsonResponse(resume, { status: 201 });
      }

      if (resumeId && method === "PUT") {
        const payload = JSON.parse(init?.body as string);
        const previousResume = resumes.find((resume) => resume.id === resumeId);
        const resume = {
          ...payload,
          id: resumeId,
          createdAt: previousResume?.createdAt || "2026-06-05T10:00:00Z",
          updatedAt: "2026-06-05T10:05:00Z",
        };

        resumes = resumes.map((currentResume) =>
          currentResume.id === resumeId ? resume : currentResume,
        );

        return jsonResponse(resume);
      }

      if (resumeId && method === "DELETE") {
        resumes = resumes.filter((resume) => resume.id !== resumeId);

        return new Response(null, { status: 204 });
      }

      return jsonResponse({ detail: "Not found" }, { status: 404 });
    }),
  );
}

async function startNewResume(user: ReturnType<typeof userEvent.setup>) {
  render(<ResumesPage />);

  await waitFor(() => {
    expect(screen.getByText("No resumes yet.")).toBeInTheDocument();
  });

  await user.click(screen.getAllByRole("button", { name: "Create New Resume" })[0]);
}

async function fillRequiredResume(user: ReturnType<typeof userEvent.setup>) {
  await user.clear(screen.getByLabelText("Resume Title"));
  await user.type(screen.getByLabelText("Resume Title"), "Software Resume");
  await user.type(screen.getByLabelText("Personal Website"), "https://example.com");
  await user.type(screen.getByLabelText("Phone"), "555-0100");
  await user.type(screen.getByLabelText("Email"), "student@example.com");
  await user.type(screen.getByPlaceholderText("Add a skill tag"), "Python");
  await user.click(screen.getByRole("button", { name: "Add Skill" }));
  await user.click(screen.getByRole("button", { name: "Add Education" }));
  await user.type(screen.getByLabelText("School Name"), "Duke University");
  await user.type(screen.getByLabelText("Degree"), "MS");
  await user.type(screen.getByLabelText("Diploma"), "Computer Science");

  const startDates = screen.getAllByLabelText("Start Date");
  const endDates = screen.getAllByLabelText("End Date");

  await user.type(startDates[0], "2024.09");
  await user.type(endDates[0], "2026.05");
}

describe("Resume Builder", () => {
  beforeEach(() => {
    resumes = [];
    setupFetchMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("validates required fields and date format before saving", async () => {
    const user = userEvent.setup();

    await startNewResume(user);

    await user.click(screen.getByRole("button", { name: "Save Resume" }));

    expect(screen.getByText(/Personal website is required/)).toBeInTheDocument();
    expect(resumes).toHaveLength(0);

    await fillRequiredResume(user);
    await user.clear(screen.getAllByLabelText("Start Date")[0]);
    await user.type(screen.getAllByLabelText("Start Date")[0], "2024-09");
    await user.click(screen.getByRole("button", { name: "Save Resume" }));

    expect(screen.getByText(/must use YYYY\.MM format/)).toBeInTheDocument();
    expect(resumes).toHaveLength(0);
  });

  test("saves a valid resume and switches to formatted preview mode", async () => {
    const user = userEvent.setup();

    await startNewResume(user);
    await fillRequiredResume(user);
    await user.click(screen.getByRole("button", { name: "Save Resume" }));

    const preview = await screen.findByRole("heading", {
      name: "Software Resume",
      level: 2,
    });

    expect(preview.closest(".resume-preview")).toBeInTheDocument();
    expect(screen.queryByLabelText("Personal Website")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
    expect(screen.queryByText("Work Experience")).not.toBeInTheDocument();
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
    expect(resumes[0].education[0].startDate).toBe("2024.09");
  });

  test("edit preserves saved fields and updates preview", async () => {
    const user = userEvent.setup();

    await startNewResume(user);
    await fillRequiredResume(user);
    await user.click(screen.getByRole("button", { name: "Save Resume" }));
    await screen.findByRole("button", { name: "Edit" });
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByLabelText("Personal Website")).toHaveValue("https://example.com");
    expect(screen.getByLabelText("Template")).toHaveValue("US");

    await user.clear(screen.getByLabelText("Resume Title"));
    await user.type(screen.getByLabelText("Resume Title"), "Backend Resume");
    await user.click(screen.getByRole("button", { name: "Save Resume" }));

    expect(
      await screen.findByRole("heading", { name: "Backend Resume", level: 2 }),
    ).toBeInTheDocument();
    expect(resumes[0].title).toBe("Backend Resume");
  });

  test("deletes a resume and shows empty state without stale preview or blank form", async () => {
    const user = userEvent.setup();

    await startNewResume(user);
    await fillRequiredResume(user);
    await user.click(screen.getByRole("button", { name: "Save Resume" }));
    await screen.findByRole("heading", { name: "Software Resume", level: 2 });
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(resumes).toHaveLength(0);
    });
    expect(
      screen.getByText("No resume selected or this resume has been deleted."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Software Resume")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Resume Title")).not.toBeInTheDocument();
  });

  test("saves project reorder and preview preserves saved order", async () => {
    const user = userEvent.setup();

    await startNewResume(user);
    await fillRequiredResume(user);
    await user.click(screen.getByRole("button", { name: "Add Projects" }));
    await user.type(screen.getByLabelText("Project Name"), "First Project");
    await user.type(screen.getAllByLabelText("Start Date")[1], "2025.01");
    await user.type(screen.getAllByLabelText("End Date")[1], "2025.02");
    await user.click(screen.getByRole("button", { name: "Add Projects" }));
    await user.type(screen.getAllByLabelText("Project Name")[1], "Second Project");
    await user.type(screen.getAllByLabelText("Start Date")[2], "2025.03");
    await user.type(screen.getAllByLabelText("End Date")[2], "2025.04");

    const projectCards = screen.getByText("Projects").closest("section")!;
    const firstProjectCard = within(projectCards).getByDisplayValue("First Project")
      .closest("[draggable='true']")!;
    const secondProjectCard = within(projectCards).getByDisplayValue("Second Project")
      .closest("[draggable='true']")!;

    fireEvent.dragStart(firstProjectCard);
    fireEvent.dragOver(secondProjectCard);
    fireEvent.dragEnd(firstProjectCard);

    await user.click(screen.getByRole("button", { name: "Save Resume" }));

    await screen.findByText("Second Project");

    expect(resumes[0].projects.map((project) => project.projectName)).toEqual([
      "Second Project",
      "First Project",
    ]);
    expect(
      screen.getByText("Second Project").compareDocumentPosition(
        screen.getByText("First Project"),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
