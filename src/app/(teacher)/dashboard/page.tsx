import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calcNet } from "@/lib/jwt";

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

  return (
    <div className="flex w-full flex-col gap-space-lg">
      <div className="relative overflow-hidden rounded-2xl bg-primary-container p-8 shadow-sm">
        <div className="absolute top-0 right-0 h-72 w-72 translate-x-16 -translate-y-16 rounded-full bg-secondary/10 pointer-events-none" />
        <div className="absolute bottom-0 left-48 h-48 w-48 rounded-full bg-on-tertiary-container/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary-fixed-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-on-tertiary-container animate-pulse" />
              2026 LGS Hazırlık
            </span>
            <span className="text-[12px] text-on-primary-container/50">Aktif Dönem: 2. Dönem</span>
          </div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-on-primary-container">
            Hoş geldiniz, {session?.user.name?.split(" ")[0] ?? "Öğretmen"} Hocam 👋
          </h1>
          <p className="flex items-center gap-2 text-[13px] text-on-primary-container/60">
            <span>{klass?.name ?? "Sınıf"} · LGS Hazırlık Takibi</span>
            <span className="rounded-md bg-secondary/20 px-2 py-0.5 text-[12px] font-semibold text-secondary-fixed-dim">
              {klass?.students.length ?? 0} Öğrenci
            </span>
          </p>
        </div>
        <div className="relative z-10 mt-6 flex flex-wrap gap-3">
          <Link
            href="/denemeler"
            className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-[13px] font-semibold text-on-secondary shadow-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[17px]">add_link</span>
            Deneme Linki Oluştur
          </Link>
          {latestWithResults && (
            <Link
              href={`/yanlis-sorular/${latestWithResults.id}`}
              className="flex items-center gap-2 rounded-xl bg-on-primary-container/10 border border-on-primary-container/20 px-5 py-2.5 text-[13px] font-semibold text-on-primary-container hover:bg-on-primary-container/15 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">quiz</span>
              Yanlış Soru Galerisi
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Son Deneme Sınıf Neti",
            value: avgNet.toFixed(1),
            suffix: "/ 90 net",
            icon: "bar_chart",
            accent: "text-secondary",
            bg: "bg-secondary/8",
          },
          {
            label: "Tahmini Yüzdelik Ort.",
            value: `%${avgPct.toFixed(1)}`,
            suffix: "Genel Sıralama",
            icon: "target",
            accent: "text-on-tertiary-container",
            bg: "bg-on-tertiary-container/8",
          },
          {
            label: "Bekleyen Veli Raporu",
            value: String(pendingParents),
            suffix: "gönderilmedi",
            icon: "mark_email_unread",
            accent: pendingParents > 0 ? "text-error" : "text-on-surface-variant",
            bg: pendingParents > 0 ? "bg-error/8" : "bg-surface-container-high",
          },
          {
            label: "Aktif Form Linki",
            value: String(activeExam?.links.filter((l) => !l.usedAt).length ?? 0),
            suffix: "öğrenci bekliyor",
            icon: "link",
            accent: "text-secondary",
            bg: "bg-secondary/8",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-on-surface-variant">{kpi.label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg}`}>
                <span className={`material-symbols-outlined text-[18px] ${kpi.accent}`}>{kpi.icon}</span>
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`font-metric-stat tracking-tight ${kpi.accent}`}>{kpi.value}</span>
              <span className="text-[12px] text-on-surface-variant">{kpi.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-[15px] font-semibold text-on-surface">
            Sınıf Net Gelişim Trendi
          </h2>
          {trend.length === 0 ? (
            <p className="font-body-md text-on-surface-variant">Henüz sonuç yok.</p>
          ) : (
            <svg viewBox="0 0 480 180" className="w-full">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4b41e1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4b41e1" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const pts = trend.map((t, i) => {
                  const x = 40 + (i * 400) / Math.max(1, trend.length - 1);
                  const y = 150 - (t.net / maxTrend) * 120;
                  return `${x},${y}`;
                });
                const line = pts.join(" ");
                const area = `40,150 ${line} ${40 + ((trend.length - 1) * 400) / Math.max(1, trend.length - 1)},150`;
                return (
                  <>
                    <polygon points={area} fill="url(#area)" />
                    <polyline
                      points={line}
                      fill="none"
                      stroke="#4b41e1"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    {trend.map((t, i) => {
                      const x = 40 + (i * 400) / Math.max(1, trend.length - 1);
                      const y = 150 - (t.net / maxTrend) * 120;
                      return (
                        <g key={t.name}>
                          <circle cx={x} cy={y} r="4" fill="#4b41e1" />
                          <text x={x} y={170} textAnchor="middle" fontSize="10" fill="#76777d">
                            {t.name}
                          </text>
                          <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fill="#0b1c30">
                            {t.net}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          )}
        </div>

        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="mb-5 text-[15px] font-semibold text-on-surface">Aktif Deneme</h2>
          {activeExam ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[14px] font-semibold text-on-surface leading-snug">{activeExam.name}</p>
                <p className="mt-1 text-[12px] text-on-surface-variant">
                  {activeExam.publisher} · {new Date(activeExam.date).toLocaleDateString("tr-TR")}
                </p>
              </div>
              {/* İlerleme */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-on-surface-variant">Form Tamamlama</span>
                  <span className="font-semibold text-on-surface">
                    {activeExam.links.filter((l) => l.usedAt).length}/{activeExam.links.length}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
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
              <Link
                href="/denemeler"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-[13px] font-semibold text-on-secondary hover:opacity-90 transition-opacity"
              >
                Linkleri Yönet
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="material-symbols-outlined text-[40px] text-outline">assignment</span>
              <p className="text-[13px] text-on-surface-variant">Henüz deneme oluşturulmadı</p>
              <Link href="/denemeler" className="text-[13px] font-semibold text-secondary hover:underline">
                İlk denemeyi oluştur →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
