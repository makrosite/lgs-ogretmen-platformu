import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function YanlisSorularIndex() {
  const session = await getServerSession(authOptions);
  const exam = await prisma.exam.findFirst({
    where: { class: { teacherId: session!.user.id } },
    orderBy: { date: "desc" },
  });
  if (exam) redirect(`/yanlis-sorular/${exam.id}`);

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
      <span className="material-symbols-outlined mb-2 text-4xl text-outline">quiz</span>
      <p className="font-headline-sm text-on-surface">Henüz deneme yok</p>
      <Link href="/denemeler" className="mt-4 inline-block font-label-md text-secondary">
        Deneme oluştur
      </Link>
    </div>
  );
}
