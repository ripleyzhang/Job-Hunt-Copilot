import type { ReactNode } from "react";

import type { BulletPoint, Resume } from "../../../types";

export function ResumePreview({ resume }: { resume: Resume }) {
  const hasWorkExperience = resume.workExperiences.length > 0;
  const hasProjects = resume.projects.length > 0;

  return (
    <article
      className={`resume-preview mx-auto bg-white text-zinc-950 shadow-xl ${
        resume.templateId === "China" ? "resume-template-china" : "resume-template-us"
      }`}
    >
      <div className="resume-page">
        <header className="border-b border-zinc-300 pb-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight">{resume.title}</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {resume.contacts.website} | {resume.contacts.phone} |{" "}
            {resume.contacts.email}
          </p>
        </header>

        <PreviewSection title="Skills">
          <p className="text-sm leading-6">
            {resume.skills.map((skill) => skill.label).join(", ")}
          </p>
        </PreviewSection>

        <PreviewSection title="Education">
          {resume.education.map((item) => (
            <PreviewItem key={item.id}>
              <div className="flex justify-between gap-4">
                <div>
                  <h4 className="font-semibold">{item.schoolName}</h4>
                  <p className="text-sm text-zinc-700">
                    {item.degree}, {item.diploma}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-zinc-600">
                  {item.startDate} - {item.endDate}
                </p>
              </div>
            </PreviewItem>
          ))}
        </PreviewSection>

        {hasWorkExperience && (
          <PreviewSection title="Work Experience">
            {resume.workExperiences.map((item) => (
              <PreviewItem key={item.id}>
                <div className="flex justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">{item.company}</h4>
                    <p className="text-sm text-zinc-700">{item.role}</p>
                    {item.skills.length > 0 && (
                      <p className="text-xs text-zinc-500">
                        {item.skills.map((skill) => skill.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm text-zinc-600">
                    {item.startDate} - {item.endDate}
                  </p>
                </div>
                <BulletList bullets={item.bullets} />
              </PreviewItem>
            ))}
          </PreviewSection>
        )}

        {hasProjects && (
          <PreviewSection title="Projects">
            {resume.projects.map((item) => (
              <PreviewItem key={item.id}>
                <div className="flex justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">{item.projectName}</h4>
                    {item.skills.length > 0 && (
                      <p className="text-xs text-zinc-500">
                        {item.skills.map((skill) => skill.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm text-zinc-600">
                    {item.startDate} - {item.endDate}
                  </p>
                </div>
                <BulletList bullets={item.bullets} />
              </PreviewItem>
            ))}
          </PreviewSection>
        )}
      </div>
    </article>
  );
}

function PreviewSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="resume-section mt-4">
      <h3 className="border-b border-zinc-300 pb-1 text-sm font-bold uppercase tracking-wide text-zinc-800">
        {title}
      </h3>
      <div className="mt-2 grid gap-3">{children}</div>
    </section>
  );
}

function PreviewItem({ children }: { children: ReactNode }) {
  return <div className="resume-item break-inside-avoid">{children}</div>;
}

function BulletList({ bullets }: { bullets: BulletPoint[] }) {
  const visibleBullets = bullets.filter((bullet) => bullet.text.trim());

  if (visibleBullets.length === 0) {
    return null;
  }

  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
      {visibleBullets.map((bullet) => (
        <li className="break-inside-avoid" key={bullet.id}>
          {bullet.text}
        </li>
      ))}
    </ul>
  );
}
