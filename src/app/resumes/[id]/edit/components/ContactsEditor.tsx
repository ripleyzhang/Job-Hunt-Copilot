import type { ResumeContacts } from "../../../types";
import { Input, SectionHeader } from "./FormControls";

export function ContactsEditor({
  contacts,
  updateContacts,
}: {
  contacts: ResumeContacts;
  updateContacts: (field: keyof ResumeContacts, value: string) => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <SectionHeader title="Contacts" />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Input
          label="Personal Website"
          onChange={(value) => updateContacts("website", value)}
          value={contacts.website}
        />
        <Input
          label="Phone"
          onChange={(value) => updateContacts("phone", value)}
          value={contacts.phone}
        />
        <Input
          label="Email"
          onChange={(value) => updateContacts("email", value)}
          type="email"
          value={contacts.email}
        />
      </div>
    </section>
  );
}
