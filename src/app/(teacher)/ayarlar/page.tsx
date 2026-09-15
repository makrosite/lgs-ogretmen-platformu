import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/teacher/SignOutButton";

export default async function AyarlarPage() {
  const session = await getServerSession(authOptions);
  const teacher = await prisma.teacher.findUnique({
    where: { id: session!.user.id },
    include: { classes: { include: { _count: { select: { students: true } } } } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-space-lg">
      <h1 className="font-headline-lg text-on-surface">Ayarlar & Kurum Bilgisi</h1>
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="font-headline-sm text-on-surface">Öğretmen</h2>
        <dl className="mt-4 space-y-2 font-body-md">
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Ad</dt>
            <dd>{teacher?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">E-posta</dt>
            <dd>{teacher?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Ünvan</dt>
            <dd>{teacher?.title}</dd>
          </div>
        </dl>
      </div>
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="font-headline-sm text-on-surface">Sınıflar</h2>
        <ul className="mt-3 space-y-2">
          {teacher?.classes.map((c) => (
            <li key={c.id} className="flex justify-between font-body-md">
              <span>{c.name}</span>
              <span className="text-on-surface-variant">{c._count.students} öğrenci</span>
            </li>
          ))}
        </ul>
      </div>
      <SignOutButton />
    </div>
  );
}
