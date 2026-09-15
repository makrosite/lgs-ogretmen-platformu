import { prisma } from "@/lib/prisma";
import { TercihClient } from "@/components/teacher/TercihClient";

export default async function TercihPage() {
  const schools = await prisma.school.findMany({
    include: {
      yearData: { orderBy: { year: "desc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <h1 className="font-headline-lg text-on-surface">Tercih & Taban Puanlar</h1>
        <p className="font-body-md text-on-surface-variant">
          5 yıllık taban puan ve yüzdelik dilim motoru
        </p>
      </div>
      <TercihClient
        schools={schools.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          city: s.city,
          district: s.district,
          yearData: s.yearData.map((y) => ({
            year: y.year,
            minScore: y.minScore,
            maxScore: y.maxScore,
            quota: y.quota,
            percentile: y.percentile,
          })),
        }))}
      />
    </div>
  );
}
