import type { EducationItem } from "../../../types";
import { EditorSection } from "./EditorSection";
import { EntryHeader, Input } from "./FormControls";

export function EducationEditor({
  addEducation,
  education,
  removeEducation,
  updateEducation,
}: {
  addEducation: () => void;
  education: EducationItem[];
  removeEducation: (id: string) => void;
  updateEducation: (id: string, field: keyof EducationItem, value: string) => void;
}) {
  return (
    <EditorSection
      isEmpty={education.length === 0}
      onAdd={addEducation}
      title="Education"
    >
      {education.map((item) => (
        <div className="rounded-lg border border-zinc-200 p-4" key={item.id}>
          <EntryHeader onRemove={() => removeEducation(item.id)} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="School Name"
              onChange={(value) => updateEducation(item.id, "schoolName", value)}
              value={item.schoolName}
            />
            <Input
              label="Degree"
              onChange={(value) => updateEducation(item.id, "degree", value)}
              value={item.degree}
            />
            <Input
              label="Start Date"
              onChange={(value) => updateEducation(item.id, "startDate", value)}
              placeholder="YYYY.MM"
              value={item.startDate}
            />
            <Input
              label="End Date"
              onChange={(value) => updateEducation(item.id, "endDate", value)}
              placeholder="YYYY.MM"
              value={item.endDate}
            />
            <Input
              label="Diploma"
              onChange={(value) => updateEducation(item.id, "diploma", value)}
              value={item.diploma}
            />
          </div>
        </div>
      ))}
    </EditorSection>
  );
}
