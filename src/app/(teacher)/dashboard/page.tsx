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
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-8 -translate-y-8 rounded-full bg-secondary/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="rounded-full bg-secondary-fixed px-space-xs py-0.5 font-label-sm font-bold uppercase tracking-wider text-on-secondary-fixed-variant">
              2026 LGS Hazırlık
            </span>
            <span className="flex items-center gap-1 font-label-sm text-on-surface-variant">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-tertiary-fixed-dim" />
              Aktif Dönem: 2. Dönem
            </span>
          </div>
          <h1 className="font-headline-lg tracking-tight text-on-surface">
            Hoş geldiniz, {session?.user.name?.split(" ")[0] ?? "Öğretmen"} Hocam
          </h1>
          <p className="flex flex-wrap items-center gap-space-xs font-body-md text-on-surface-variant">
            <span>{klass?.name ?? "Sınıf"} LGS Hazırlık Takibi</span>
            <span className="text-outline">•</span>
            <span className="rounded bg-secondary/10 px-space-xs py-0.5 font-label-md font-semibold text-secondary">
              {klass?.students.length ?? 0} Öğrenci
            </span>
          </p>
        </div>
        <div className="relative z-10 mt-space-md flex flex-wrap gap-space-sm">
          <Link
            href="/denemeler"
            className="flex items-center gap-space-xs rounded-xl bg-on-tertiary-container px-space-md py-space-sm font-label-md text-white shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Hızlı Deneme Linki Gönder
          </Link>
          {latestWithResults && (
            <Link
              href={`/yanlis-sorular/${latestWithResults.id}`}
              className="flex items-center gap-space-xs rounded-xl bg-surface-container-high px-space-md py-space-sm font-label-md text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">quiz</span>
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
          },
          {
            label: "Tahmini Yüzdelik Ort.",
            value: `%${avgPct.toFixed(1)}`,
            suffix: "Genel Sıralama",
            icon: "target",
          },
          {
            label: "Bekleyen Veli Raporu",
            value: String(pendingParents),
            suffix: "gönderilmedi",
            icon: "mark_email_unread",
          },
          {
            label: "Aktif Form Linki",
            value: String(activeExam?.links.filter((l) => !l.usedAt).length ?? 0),
            suffix: "öğrenci bekliyor",
            icon: "link",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-md text-on-surface-variant">{kpi.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-secondary">
                <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
              </span>
            </div>
            <div className="my-space-sm flex items-baseline gap-space-xs">
              <span className="font-metric-stat tracking-tight text-on-surface">{kpi.value}</span>
              <span className="font-body-sm text-on-surface-variant">{kpi.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-3">
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-2">
          <h2 className="mb-space-md font-headline-sm text-on-surface">
            Son Deneme Net Gelişim Trendi
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

        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h2 className="mb-space-md font-headline-sm text-on-surface">Aktif Deneme Linki</h2>
          {activeExam ? (
            <div className="space-y-space-md">
              <p className="font-label-lg text-on-surface">{activeExam.name}</p>
              <p className="font-body-sm text-on-surface-variant">
                {activeExam.publisher} · {new Date(activeExam.date).toLocaleDateString("tr-TR")}
              </p>
              <p className="font-body-md text-on-surface">
                {activeExam.links.filter((l) => l.usedAt).length}/{activeExam.links.length} gönderim
              </p>
              <Link
                href="/denemeler"
                className="inline-flex items-center gap-1 rounded-xl bg-secondary px-space-md py-space-sm font-label-md text-on-secondary"
              >
                Linkleri Yönet
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          ) : (
            <p className="font-body-md text-on-surface-variant">Deneme oluşturun.</p>
          )}
        </div>
      </div>
    </div>
  );
}
