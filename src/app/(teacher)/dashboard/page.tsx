import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calcNet } from "@/lib/jwt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const klass = await prisma.class.findFirst({
    where: { teacherId: session!.user.id },
    include: {
      students: true,
      exams: {
        orderBy: { date: "desc" },
        include: {
          results: { include: { subjectResults: true, student: true } },
          links: true,
        },
      },
    },
  });

  const exams = klass?.exams ?? [];
  const latestWithResults = exams.find((e) => e.results.length > 0);
  const activeExam = exams.find((e) => e.links.some((l) => !l.usedAt)) ?? exams[0];

  let avgNet = 0;
  if (latestWithResults?.results.length) {
    const nets = latestWithResults.results.map((r) =>
      r.subjectResults.reduce((s, sr) => s + calcNet(sr.correct, sr.wrong), 0)
    );
    avgNet = Math.round((nets.reduce((a, b) => a + b, 0) / nets.length) * 10) / 10;
  }

  const avgPct = latestWithResults?.results.length
    ? latestWithResults.results.reduce((s, r) => s + (r.percentile ?? 0), 0) /
      latestWithResults.results.length
    : 0;

  const pendingParents =
    latestWithResults?.results.filter((r) => !r.parentNotified).length ?? 0;

  const trend = exams
    .filter((e) => e.results.length)
    .slice(0, 6)
    .reverse()
    .map((e) => {
      const nets = e.results.map((r) =>
        r.subjectResults.reduce((s, sr) => s + calcNet(sr.correct, sr.wrong), 0)
      );
      return {
        name: e.name.slice(0, 12),
        net: nets.length
          ? Math.round((nets.reduce((a, b) => a + b, 0) / nets.length) * 10) / 10
          : 0,
      };
    });

  const maxTrend = Math.max(90, ...trend.map((t) => t.net));

  const kpis = [
    {
      label: "Son Deneme Sınıf Neti",
      value: avgNet.toFixed(1),
      suffix: "/ 90 net",
      icon: "bar_chart",
      color: "text-secondary",
      bg: "bg-secondary/8",
      progress: (avgNet / 90) * 100,
    },
    {
      label: "Tahmini Yüzdelik Ort.",
      value: `%${avgPct.toFixed(1)}`,
      suffix: "Genel Sıralama",
      icon: "target",
      color: "text-on-tertiary-container",
      bg: "bg-on-tertiary-container/8",
      progress: avgPct,
    },
    {
      label: "Bekleyen Veli Raporu",
      value: String(pendingParents),
      suffix: "gönderilmedi",
      icon: "mark_email_unread",
      color: pendingParents > 0 ? "text-error" : "text-slate-400",
      bg: pendingParents > 0 ? "bg-error/8" : "bg-slate-50",
      progress: null,
    },
    {
      label: "Aktif Form Linki",
      value: String(activeExam?.links.filter((l) => !l.usedAt).length ?? 0),
      suffix: "öğrenci bekliyor",
      icon: "link",
      color: "text-secondary",
      bg: "bg-secondary/8",
      progress: null,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Başlık */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {klass?.name ?? "Sınıf"} — Genel Bakış
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {session?.user.name} · 2026 LGS Hazırlık · {klass?.students.length ?? 0} öğrenci
            </p>
          </div>
          <div className="flex items-center gap-2">
            {latestWithResults && (
              <Link href={`/yanlis-sorular/${latestWithResults.id}`}>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[14px]">quiz</span>
                  Yanlış Soru Galerisi
                </Button>
              </Link>
            )}
            <Link href="/denemeler">
              <Button size="sm">
                <span className="material-symbols-outlined text-[14px]">add_link</span>
                Yeni Deneme Linki
              </Button>
            </Link>
          </div>
        </div>
        <Separator className="mt-4" />
      </div>

      {/* KPI Kartlar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </CardTitle>
                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${kpi.bg}`}>
                  <span className={`material-symbols-outlined text-[15px] ${kpi.color}`}>{kpi.icon}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold tracking-tight ${kpi.color}`}>{kpi.value}</span>
                <span className="text-xs text-slate-400">{kpi.suffix}</span>
              </div>
              {kpi.progress !== null && (
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-secondary transition-all"
                    style={{ width: `${Math.min(100, kpi.progress)}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alt satır */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Trend grafiği */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sınıf Net Gelişim Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-slate-400">Henüz sonuç yok.</p>
              </div>
            ) : (
              <svg viewBox="0 0 480 160" className="w-full">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4b41e1" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#4b41e1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const pts = trend.map((t, i) => {
                    const x = 40 + (i * 400) / Math.max(1, trend.length - 1);
                    const y = 130 - (t.net / maxTrend) * 100;
                    return `${x},${y}`;
                  });
                  const line = pts.join(" ");
                  const area = `40,130 ${line} ${40 + ((trend.length - 1) * 400) / Math.max(1, trend.length - 1)},130`;
                  return (
                    <>
                      <polygon points={area} fill="url(#area)" />
                      <polyline
                        points={line}
                        fill="none"
                        stroke="#4b41e1"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />
                      {trend.map((t, i) => {
                        const x = 40 + (i * 400) / Math.max(1, trend.length - 1);
                        const y = 130 - (t.net / maxTrend) * 100;
                        return (
                          <g key={t.name}>
                            <circle cx={x} cy={y} r="3.5" fill="white" stroke="#4b41e1" strokeWidth="2" />
                            <text x={x} y={150} textAnchor="middle" fontSize="9" fill="#94a3b8">{t.name}</text>
                            <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e293b">{t.net}</text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}
          </CardContent>
        </Card>

        {/* Aktif Deneme */}
        <Card>
          <CardHeader>
            <CardTitle>Aktif Deneme</CardTitle>
          </CardHeader>
          <CardContent>
            {activeExam ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activeExam.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {activeExam.publisher} · {new Date(activeExam.date).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Form Tamamlama</span>
                    <span className="font-semibold text-slate-700">
                      {activeExam.links.filter((l) => l.usedAt).length}/{activeExam.links.length}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-secondary transition-all"
                      style={{
                        width: activeExam.links.length
                          ? `${(activeExam.links.filter((l) => l.usedAt).length / activeExam.links.length) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <Link href="/denemeler">
                  <Button variant="outline" size="sm" className="w-full">
                    Linkleri Yönet
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="material-symbols-outlined text-[32px] text-slate-300">assignment</span>
                <p className="text-sm text-slate-400">Henüz deneme oluşturulmadı</p>
                <Link href="/denemeler">
                  <Button size="sm" className="mt-1">İlk denemeyi oluştur</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
