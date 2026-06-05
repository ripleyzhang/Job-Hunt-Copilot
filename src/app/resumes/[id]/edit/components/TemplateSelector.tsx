import type { ResumeForm, ResumeTemplateId } from "../../../types";
import { Input, Select } from "./FormControls";

export function TemplateSelector({
  form,
  updateField,
}: {
  form: ResumeForm;
  updateField: (
    field: keyof Pick<ResumeForm, "title" | "templateId">,
    value: string,
  ) => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <Input
          label="Resume Title"
          onChange={(value) => updateField("title", value)}
          value={form.title}
        />
        <Select
          label="Template"
          onChange={(value: ResumeTemplateId) => updateField("templateId", value)}
          options={["US", "China"]}
          value={form.templateId}
        />
      </div>
    </section>
  );
}
