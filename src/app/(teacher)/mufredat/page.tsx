import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function statusColor(status: string) {
  if (status === "critical") return "border-l-error";
  if (status === "done") return "border-l-on-tertiary-container";
  if (status === "progress") return "border-l-secondary";
  return "border-l-slate-200";
}

function statusBadge(status: string) {
  if (status === "critical") return <Badge variant="destructive">Kritik</Badge>;
  if (status === "done") return <Badge variant="success">Tamamlandı</Badge>;
  if (status === "progress") return <Badge variant="default">Devam</Badge>;
  return <Badge variant="secondary">Başlanmadı</Badge>;
}

export default async function MufredatPage() {
  const session = await getServerSession(authOptions);
  const klass = await prisma.class.findFirst({ where: { teacherId: session!.user.id } });
  const items = await prisma.kazanimProgress.findMany({
    where: { classId: klass?.id },
    orderBy: { masteryPct: "asc" },
  });
  const notes = await prisma.zumreNote.findMany({
    where: { teacherId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const avg = items.length === 0
    ? 0
    : Math.round((items.reduce((s, i) => s + i.masteryPct, 0) / items.length) * 10) / 10;
  const critical = items.filter((i) => i.status === "critical").length;
  const donePct = items.length === 0
    ? 0
    : Math.round((items.filter((i) => i.status === "done").length / items.length) * 1000) / 10;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Müfredat & Konu Takip</h1>
            <p className="mt-0.5 text-sm text-slate-500">MEB kazanım matrisi</p>
          </div>
          <Badge variant="default" className="text-sm px-3 py-1">Hafta 8</Badge>
        </div>
        <Separator className="mt-4" />
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Müfredat", value: `%${donePct}`, icon: "check_circle", color: "text-on-tertiary-container" },
          { label: "Hakimiyet", value: `%${avg}`, icon: "school", color: "text-secondary" },
          { label: "Kritik Konu", value: String(critical), icon: "warning", color: "text-error" },
          { label: "Ödev", value: "%88", icon: "assignment_turned_in", color: "text-secondary" },
        ].map((k) => (
          <Card key={k.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wide text-slate-500">{k.label}</CardTitle>
                <span className={`material-symbols-outlined text-[16px] ${k.color}`}>{k.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold tracking-tight ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-8">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border border-slate-200 border-l-4 bg-white p-4 shadow-sm ${statusColor(item.status)}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-500">{item.code}</span>
                    {statusBadge(item.status)}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.subject}</p>
                </div>
                <span className="text-lg font-bold text-slate-700">%{item.masteryPct}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${item.masteryPct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card>
            <CardHeader><CardTitle>Bu Haftanın Odağı</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Üslü ifadeler ve köklü ifadeler tekrar seti.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Hakimiyet Haritası</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {items.concat(items).slice(0, 14).map((item, i) => {
                  const bg = item.masteryPct < 50
                    ? "bg-red-100 text-red-600"
                    : item.masteryPct < 75
                      ? "bg-secondary/10 text-secondary"
                      : "bg-emerald-100 text-emerald-700";
                  return (
                    <div
                      key={`${item.id}-${i}`}
                      className={`flex h-8 items-center justify-center rounded text-[10px] font-bold ${bg}`}
                      title={item.title}
                    >
                      {Math.round(item.masteryPct)}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Zümre Notları</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-md bg-slate-50 p-2.5 text-xs text-slate-600">{n.content}</li>
                ))}
                {notes.length === 0 && <p className="text-xs text-slate-400">Henüz not yok.</p>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
