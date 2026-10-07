import Link from "next/link";

const sections = [
  {
    title: "Workspace",
    items: [
      ["Overview", "/"],
      ["AI Systems", "/ai-systems"],
      ["Rules", "/rules"],
      ["Evidence", "/evidence"],
      ["Assurance", "/assurance"],
    ],
  },
  {
    title: "Governance",
    items: [
      ["Framework", "https://docs.aigoframework.com"],
      ["Website", "https://aigoframework.com"],
    ],
  },
];

export default function StudioSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] shrink-0 border-r border-[#dfe3e8] bg-white lg:flex lg:flex-col">
      <div className="border-b border-[#e5e7eb] px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#18202b] text-sm font-bold tracking-tight text-white">
            A
          </div>

          <div>
            <div className="text-[15px] font-semibold tracking-tight">
              AIGO
            </div>
            <div className="text-[11px] text-[#737b87]">
              Framework Studio
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title} className="mb-7">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9299a3]">
              {section.title}
            </div>

            <div className="space-y-0.5">
              {section.items.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="block rounded-md px-3 py-2 text-[13px] text-[#626b77] transition-colors hover:bg-[#f4f5f7] hover:text-[#18202b]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#e5e7eb] p-4">
        <div className="rounded-md border border-[#e1e5e9] bg-[#fafbfc] p-3">
          <div className="text-[11px] font-medium text-[#626b77]">
            Framework version
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-semibold">AIGO v0.1</span>
            <span className="rounded bg-[#edf5ef] px-1.5 py-0.5 text-[10px] font-medium text-[#3e6b4d]">
              Baseline
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
