import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { calcNet } from "@/lib/jwt";
import { buildParentMessage, whatsappUrl } from "@/lib/whatsapp";
import { signReportToken } from "@/lib/jwt";
import { GalleryClient } from "@/components/teacher/GalleryClient";

const SUBJECTS = ["Tümü", "Matematik", "Fen", "Türkçe", "Sosyal", "İngilizce", "Din", "İnkılap"];

export default async function YanlisSoruGalerisiPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ subject?: string }>;
}) {
  const { examId } = await params;
  const { subject = "Tümü" } = await searchParams;
  const session = await getServerSession(authOptions);

  const exam = await prisma.exam.findFirst({
    where: { id: examId, class: { teacherId: session!.user.id } },
    include: {
      class: { include: { students: true } },
      results: {
        include: {
          student: true,
          subjectResults: true,
          wrongQuestions: true,
        },
      },
    },
  });
  if (!exam) notFound();

  const allWrong = exam.results.flatMap((r) =>
    r.wrongQuestions.map((w) => ({
      ...w,
      studentName: r.student.name,
      studentId: r.student.id,
      examResultId: r.id,
    }))
  );

  const filtered =
    subject === "Tümü" ? allWrong : allWrong.filter((w) => w.subject === subject);

  const byQ = new Map<string, typeof filtered>();
  for (const w of allWrong) {
    const key = `${w.subject}-${w.questionNo}`;
    if (!byQ.has(key)) byQ.set(key, []);
    byQ.get(key)!.push(w);
  }
  const top3 = [...byQ.entries()]
    .map(([key, items]) => ({
      key,
      subject: items[0].subject,
      questionNo: items[0].questionNo,
      count: items.length,
      pct: Math.round((items.length / Math.max(1, exam.results.length)) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const subjectCounts = SUBJECTS.slice(1).map((s) => ({
    s,
    n: allWrong.filter((w) => w.subject === s).length,
  }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const tableRows = await Promise.all(
    exam.results.map(async (r) => {
      const net = r.subjectResults.reduce((s, sr) => s + calcNet(sr.correct, sr.wrong), 0);
      const reportToken = await signReportToken({
        studentId: r.studentId,
        examResultId: r.id,
      });
      const reportUrl = `${appUrl}/rapor/${reportToken}`;
      const wa =
        r.student.parentPhone &&
        whatsappUrl(
          r.student.parentPhone,
          buildParentMessage({
            studentName: r.student.name,
            examName: exam.name,
            net: Math.round(net * 10) / 10,
            score: r.projectedScore ?? 0,
            percentile: r.percentile ?? 0,
            reportUrl,
          })
        );
      return {
        id: r.id,
        studentId: r.studentId,
        name: r.student.name,
        correct: r.subjectResults.reduce((s, x) => s + x.correct, 0),
        wrong: r.subjectResults.reduce((s, x) => s + x.wrong, 0),
        blank: r.subjectResults.reduce((s, x) => s + x.blank, 0),
        net: Math.round(net * 10) / 10,
        score: r.projectedScore ?? 0,
        photos: r.wrongQuestions.filter((w) => w.photoUrl).length,
        parentNotified: r.parentNotified,
        wa,
      };
    })
  );

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-wrap items-start justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">{exam.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-space-sm">
            <span className="rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-secondary">
              {new Date(exam.date).toLocaleDateString("tr-TR")}
            </span>
            <span className="font-body-sm text-on-surface-variant">
              {exam.results.length}/{exam.class.students.length} katılım
            </span>
          </div>
        </div>
        <div className="flex gap-space-sm">
          <form
            action={async () => {
              "use server";
              await prisma.exam.update({
                where: { id: examId },
                data: { locked: !exam.locked },
              });
            }}
          >
            <button
              type="submit"
              className="rounded-xl bg-surface-container-high px-space-md py-space-sm font-label-md"
            >
              {exam.locked ? "Kilidi Aç" : "Sonuçları Kilitle"}
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((s) => {
          const count =
            s === "Tümü" ? allWrong.length : subjectCounts.find((x) => x.s === s)?.n ?? 0;
          const active = subject === s;
          return (
            <Link
              key={s}
              href={`?subject=${encodeURIComponent(s)}`}
              className={`rounded-xl px-3 py-1.5 font-label-md ${
                active
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {s}
              {count > 0 && (
                <span className="ml-1 rounded-full bg-error/10 px-1.5 text-error">{count}</span>
              )}
            </Link>
          );
        })}
      </div>

      {top3.length > 0 && (
        <div>
          <h2 className="mb-space-sm font-headline-sm text-on-surface">Top 3 Kritik Soru</h2>
          <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
            {top3.map((t) => (
              <div
                key={t.key}
                className="rounded-xl border-l-4 border-error bg-surface-container-lowest p-space-md shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">local_fire_department</span>
                  <span className="font-label-lg text-on-surface">
                    {t.subject} Soru {t.questionNo}
                  </span>
                </div>
                <p className="mt-2 font-metric-stat text-error">%{t.pct}</p>
                <p className="font-body-sm text-on-surface-variant">{t.count} öğrenci yanıldı</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <GalleryClient
        items={filtered.map((w) => ({
          id: w.id,
          subject: w.subject,
          questionNo: w.questionNo,
          photoUrl: w.photoUrl,
          studentName: w.studentName,
          kazanim: w.kazanim,
          teacherDiag: w.teacherDiag,
          solvedInClass: w.solvedInClass,
        }))}
      />

      <div className="overflow-x-auto rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <h2 className="mb-space-md font-headline-sm text-on-surface">Öğrenci Tablosu</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant font-label-md text-on-surface-variant">
              <th className="py-2">Ad</th>
              <th>D</th>
              <th>Y</th>
              <th>B</th>
              <th>Net</th>
              <th>Puan</th>
              <th>Foto</th>
              <th>Veli</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r) => (
              <tr key={r.id} className="border-b border-outline-variant/30 font-body-sm">
                <td className="py-2 font-label-md">
                  <Link href={`/ogrenciler/${r.studentId}`} className="text-secondary">
                    {r.name}
                  </Link>
                </td>
                <td>{r.correct}</td>
                <td>{r.wrong}</td>
                <td>{r.blank}</td>
                <td>{r.net}</td>
                <td>{r.score}</td>
                <td>{r.photos}</td>
                <td>
                  {r.parentNotified ? (
                    <span className="rounded bg-tertiary-fixed/30 px-2 py-0.5 font-label-sm text-on-tertiary-container">
                      Gönderildi
                    </span>
                  ) : (
                    <span className="rounded bg-error-container px-2 py-0.5 font-label-sm text-error">
                      Gönderilmedi
                    </span>
                  )}
                </td>
                <td>
                  {r.wa && (
                    <a
                      href={r.wa}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#10B981]/10 px-2 py-1 font-label-sm text-[#047857]"
                    >
                      WhatsApp
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
