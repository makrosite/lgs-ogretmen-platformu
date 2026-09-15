import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function KaynakIndex() {
  const session = await getServerSession(authOptions);
  const first = await prisma.student.findFirst({
    where: { class: { teacherId: session!.user.id } },
    orderBy: { number: "asc" },
  });
  if (first) redirect(`/kaynak-takip/${first.id}`);
  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
      <p className="font-headline-sm">Öğrenci yok</p>
      <Link href="/ogrenciler" className="font-label-md text-secondary">
        Öğrenciler
      </Link>
    </div>
  );
}
