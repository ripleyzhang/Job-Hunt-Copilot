import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

type TestApplication = {
  id: string;
  company: string;
  roleTitle: string;
  jobDescription: string;
  applicationDate: string | null;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected" | "Withdrawn";
  resumeVersion: string;
  requiredTechStack: string[];
  notes: string;
};

let applications: TestApplication[] = [];

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
      const applicationId = url.match(/\/applications\/([^/]+)$/)?.[1];

      if (url.endsWith("/applications") && method === "GET") {
        return jsonResponse(applications);
      }

      if (url.endsWith("/applications") && method === "POST") {
        const payload = JSON.parse(init?.body as string);
        const application = { ...payload, id: `app-${applications.length + 1}` };

        applications = [application, ...applications];

        return jsonResponse(application, { status: 201 });
      }

      if (applicationId && method === "PUT") {
        const payload = JSON.parse(init?.body as string);
        const application = { ...payload, id: applicationId };

        applications = applications.map((currentApplication) =>
          currentApplication.id === applicationId
            ? application
            : currentApplication,
        );

        return jsonResponse(application);
      }

      if (applicationId && method === "DELETE") {
        applications = applications.filter(
          (application) => application.id !== applicationId,
        );

        return new Response(null, { status: 204 });
      }

      return jsonResponse({ detail: "Not found" }, { status: 404 });
    }),
  );
}

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
    applications = [];
    setupFetchMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("loads applications from the API", async () => {
    applications = [
      {
        id: "app-1",
        company: "OpenAI",
        roleTitle: "Software Engineering Intern",
        jobDescription: "",
        applicationDate: "2026-06-01",
        status: "Applied",
        resumeVersion: "software-v1",
        requiredTechStack: ["React", "TypeScript"],
        notes: "Applied through company website.",
      },
    ];

    render(<Home />);

    expect(screen.getByText("Loading applications...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Software Engineering Intern")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/applications",
      expect.objectContaining({ headers: { "Content-Type": "application/json" } }),
    );
  });

  test("shows an error when loading applications fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ detail: "Server error" }, { status: 500 })),
    );

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText("Could not load applications from the backend."),
      ).toBeInTheDocument();
    });
  });

  test("creates an application", async () => {
    await renderTracker();

    await createApplication();

    const createdCard = await screen.findByText("Software Engineering Intern");
    const createdArticle = createdCard.closest("article");

    expect(createdArticle).not.toBeNull();

    const createdCardView = within(createdArticle as HTMLElement);

    expect(createdCardView.getByText("OpenAI")).toBeInTheDocument();
    expect(createdCardView.getByText("Applied")).toBeInTheDocument();
    expect(createdCardView.getByText("React")).toBeInTheDocument();
    expect(createdCardView.getByText("TypeScript")).toBeInTheDocument();
    expect(applications).toHaveLength(1);
    expect(applications[0]).toMatchObject({
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

    const editedCard = await screen.findByText("Full Stack Intern");
    const editedArticle = editedCard.closest("article");

    expect(editedArticle).not.toBeNull();

    const editedCardView = within(editedArticle as HTMLElement);

    expect(editedCardView.getByText("Anthropic")).toBeInTheDocument();
    expect(editedCardView.getByText("Next.js")).toBeInTheDocument();
    expect(editedCardView.getByText("Python")).toBeInTheDocument();

    expect(screen.queryByText("Software Engineering Intern")).not.toBeInTheDocument();
    expect(screen.queryByText("OpenAI")).not.toBeInTheDocument();
    expect(applications).toHaveLength(1);
    expect(applications[0]).toMatchObject({
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

    await waitFor(() => {
      expect(
        screen.queryByText("Software Engineering Intern"),
      ).not.toBeInTheDocument();
    });

    expect(screen.queryByText("OpenAI")).not.toBeInTheDocument();
    expect(screen.getByText("0 of 0 shown")).toBeInTheDocument();
    expect(
      screen.getByText("No applications match the current filters."),
    ).toBeInTheDocument();
    expect(applications).toHaveLength(0);
  });
});
