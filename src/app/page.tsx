import Link from "next/link";

const NAV_ITEMS = [
  {
    href: "/application-tracker",
    label: "Application Tracker",
  },
  {
    href: "/resumes",
    label: "Resume Builder",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Link
            className="text-sm font-medium uppercase tracking-widest text-teal-700"
            href="/"
          >
            Job Hunt Copilot
          </Link>

          <nav aria-label="Project navigation" className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-6 lg:px-8" />

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-4 text-sm text-zinc-500 sm:px-6 lg:px-8">
          Ningjing Zhang
        </div>
      </footer>
    </div>
  );
}
