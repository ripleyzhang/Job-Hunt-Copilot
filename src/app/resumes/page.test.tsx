import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
      const resumeId = url.match(/\/resumes\/([^/]+)$/)?.[1];

      if (url.endsWith("/resumes") && method === "GET") {
        return jsonResponse(resumes);
      }

      if (url.endsWith("/resumes") && method === "POST") {
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
        const resume = {
          ...payload,
          id: resumeId,
          createdAt: "2026-06-05T10:00:00Z",
          updatedAt: "2026-06-05T10:05:00Z",
        };

        resumes = resumes.map((currentResume) =>
          currentResume.id === resumeId ? resume : currentResume,
        );

        return jsonResponse(resume);
      }

      return jsonResponse({ detail: "Not found" }, { status: 404 });
    }),
  );
}

describe("Resume Builder", () => {
  beforeEach(() => {
    resumes = [];
    setupFetchMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("creates and saves a manual resume", async () => {
    const user = userEvent.setup();

    render(<ResumesPage />);

    await waitFor(() => {
      expect(screen.getByText("No resumes yet.")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "New" }));

    expect(await screen.findByText("Resume 1")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Resume Title"));
    await user.type(screen.getByLabelText("Resume Title"), "Software Resume");
    await user.type(screen.getByLabelText("Website"), "https://example.com");
    await user.type(screen.getByLabelText("Email"), "student@example.com");
    await user.type(screen.getByPlaceholderText("Add a skill tag"), "Python");
    await user.click(screen.getByRole("button", { name: "Add Skill" }));
    await user.click(screen.getByRole("button", { name: "Add Education" }));
    await user.type(screen.getByLabelText("School Name"), "Duke University");
    await user.click(screen.getByRole("button", { name: "Add Work Experiences" }));
    await user.type(screen.getByLabelText("Company"), "OpenAI");
    await user.type(screen.getByLabelText("Role"), "Engineering Intern");
    await user.type(
      screen.getByPlaceholderText("Describe impact, scope, and result..."),
      "Built internal tools.",
    );
    await user.click(screen.getByRole("button", { name: "Save Resume" }));

    await waitFor(() => {
      expect(resumes[0].title).toBe("Software Resume");
    });
    expect(resumes[0].contacts.email).toBe("student@example.com");
    expect(resumes[0].skills).toEqual([{ id: expect.any(String), label: "Python" }]);
    expect(resumes[0].education[0].schoolName).toBe("Duke University");
    expect(resumes[0].workExperiences[0].bullets[0].text).toBe(
      "Built internal tools.",
    );
  });
});
