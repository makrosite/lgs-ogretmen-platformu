import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function statusBorder(status: string) {
  if (status === "critical") return "border-error";
  if (status === "done") return "border-on-tertiary-container";
  if (status === "progress") return "border-secondary";
  return "border-outline-variant";
}

export default async function MufredatPage() {
  const session = await getServerSession(authOptions);
  const klass = await prisma.class.findFirst({
    where: { teacherId: session!.user.id },
  });
  const items = await prisma.kazanimProgress.findMany({
    where: { classId: klass?.id },
    orderBy: { masteryPct: "asc" },
  });
  const notes = await prisma.zumreNote.findMany({
    where: { teacherId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const avg =
    items.length === 0
      ? 0
      : Math.round((items.reduce((s, i) => s + i.masteryPct, 0) / items.length) * 10) / 10;
  const critical = items.filter((i) => i.status === "critical").length;
  const donePct =
    items.length === 0
      ? 0
      : Math.round((items.filter((i) => i.status === "done").length / items.length) * 1000) /
        10;

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Müfredat & Konu Takip</h1>
          <p className="font-body-md text-on-surface-variant">MEB kazanım matrisi</p>
        </div>
        <span className="rounded-full bg-secondary-fixed px-3 py-1 font-label-md text-secondary">
          Hafta 8
        </span>
      </div>

      <div className="grid grid-cols-2 gap-space-md xl:grid-cols-4">
        {[
          { label: "Müfredat", value: `%${donePct}` },
          { label: "Hakimiyet", value: `%${avg}` },
          { label: "Kritik Konu", value: String(critical) },
          { label: "Ödev", value: "%88" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <p className="font-label-md text-on-surface-variant">{k.label}</p>
            <p className="font-metric-stat text-on-surface">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12">
        <div className="space-y-space-sm lg:col-span-8">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border-l-4 bg-surface-container-lowest p-space-md shadow-sm ${statusBorder(item.status)}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded bg-surface-container px-2 py-0.5 font-label-sm text-on-surface-variant">
                    {item.code}
                  </span>
                  <h3 className="mt-1 font-headline-sm text-on-surface">{item.title}</h3>
                  <p className="font-body-sm text-on-surface-variant">{item.subject}</p>
                </div>
                <span className="font-headline-md text-on-surface">%{item.masteryPct}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${item.masteryPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-space-md lg:col-span-4">
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <h2 className="mb-space-sm font-headline-sm text-on-surface">Bu Haftanın Odağı</h2>
            <p className="font-body-md text-on-surface-variant">
              Üslü ifadeler ve köklü ifadeler tekrar seti.
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <h2 className="mb-space-sm font-headline-sm text-on-surface">Heatmap</h2>
            <div className="grid grid-cols-7 gap-1">
              {items.concat(items).slice(0, 14).map((item, i) => {
                const bg =
                  item.masteryPct < 50
                    ? "bg-error-container text-error"
                    : item.masteryPct < 75
                      ? "bg-secondary-fixed text-secondary"
                      : "bg-tertiary-fixed/40 text-on-tertiary-container";
                return (
                  <div
                    key={`${item.id}-${i}`}
                    className={`flex h-8 items-center justify-center rounded-sm font-label-sm ${bg}`}
                    title={item.title}
                  >
                    {Math.round(item.masteryPct)}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <h2 className="mb-space-sm font-headline-sm text-on-surface">Zümre Notları</h2>
            <ul className="space-y-2">
              {notes.map((n) => (
                <li key={n.id} className="rounded-lg bg-surface-container-low p-2 font-body-sm">
                  {n.content}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
