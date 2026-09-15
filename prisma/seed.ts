import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  await prisma.wrongQuestion.deleteMany();
  await prisma.subjectResult.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.studentLink.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.resourceTracker.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.student.deleteMany();
  await prisma.kazanimProgress.deleteMany();
  await prisma.class.deleteMany();
  await prisma.zumreNote.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.schoolYearData.deleteMany();
  await prisma.school.deleteMany();

  const passwordHash = await bcrypt.hash("ogretmen123", 10);
  const teacher = await prisma.teacher.create({
    data: {
      email: "selim@lgs.local",
      passwordHash,
      name: "Selim Hoca",
      title: "Matematik Zümre Bşk.",
    },
  });

  const klass = await prisma.class.create({
    data: { name: "8-A Fen & Mat", teacherId: teacher.id },
  });

  const studentNames = [
    { name: "Ayşe Kaya", number: 1, phone: "5321112233", target: "İstanbul Fen Lisesi" },
    { name: "Mehmet Demir", number: 2, phone: "5322223344", target: "Kabataş Erkek Lisesi" },
    { name: "Zeynep Yılmaz", number: 3, phone: "5323334455", target: "Cağaloğlu Anadolu" },
    { name: "Ali Çelik", number: 4, phone: "5324445566", target: "İstanbul Erkek Lisesi" },
    { name: "Elif Arslan", number: 5, phone: "5325556677", target: "Beşiktaş Anadolu" },
    { name: "Can Öztürk", number: 6, phone: "5326667788", target: "İstanbul Fen Lisesi" },
  ];

  const students = [];
  for (const s of studentNames) {
    students.push(
      await prisma.student.create({
        data: {
          name: s.name,
          number: s.number,
          classId: klass.id,
          parentPhone: s.phone,
          targetSchool: s.target,
        },
      })
    );
  }

  const exam = await prisma.exam.create({
    data: {
      name: "Özdebir Türkiye Geneli 4",
      publisher: "Özdebir",
      date: new Date("2026-03-01"),
      classId: klass.id,
    },
  });

  const exam2 = await prisma.exam.create({
    data: {
      name: "Sinan Kuzucu 4",
      publisher: "Sinan Kuzucu",
      date: new Date("2026-02-15"),
      classId: klass.id,
    },
  });

  // Create form links for first exam
  for (const st of students) {
    const token = randomBytes(24).toString("hex");
    await prisma.studentLink.create({
      data: {
        token,
        examId: exam.id,
        studentId: st.id,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });
  }

  // Sample results for exam2 (previous exam)
  for (let i = 0; i < students.length; i++) {
    const st = students[i];
    const matC = 12 + (i % 5);
    const matW = 6 - (i % 3);
    const matB = 20 - matC - matW;
    const turC = 14 + (i % 4);
    const fenC = 13 + (i % 3);
    const totalNet =
      matC - matW / 3 + (turC - 2 / 3) + (fenC - 1 / 3) + 20;
    const score = Math.round(100 + totalNet * 4.2);
    const result = await prisma.examResult.create({
      data: {
        examId: exam2.id,
        studentId: st.id,
        projectedNet: Math.round(totalNet * 100) / 100,
        projectedScore: score,
        percentile: Math.max(1, Math.round((500 - score) / 5)),
        teacherNote: "Düzenli çalışma temposunu koruyor.",
        parentNotified: i < 3,
        subjectResults: {
          create: [
            { subject: "Matematik", correct: matC, wrong: matW, blank: Math.max(0, matB) },
            { subject: "Türkçe", correct: turC, wrong: 2, blank: 4 },
            { subject: "Fen", correct: fenC, wrong: 1, blank: 6 },
            { subject: "Sosyal", correct: 8, wrong: 1, blank: 1 },
            { subject: "İngilizce", correct: 7, wrong: 1, blank: 2 },
            { subject: "Din", correct: 8, wrong: 0, blank: 2 },
            { subject: "İnkılap", correct: 8, wrong: 1, blank: 1 },
          ],
        },
        wrongQuestions: {
          create: [
            {
              subject: "Matematik",
              questionNo: 3 + i,
              kazanim: "M.8.1.1.3",
              teacherDiag: "Üslü ifadelerde işlem önceliği",
            },
            {
              subject: "Fen",
              questionNo: 7,
              kazanim: "F.8.3.2.1",
              teacherDiag: "Basınç birimleri karışmış",
            },
          ],
        },
      },
    });
    void result;
  }

  // Resources for first student
  const resource = await prisma.resourceTracker.create({
    data: {
      studentId: students[0].id,
      publisher: "Sinan Kuzucu",
      bookName: "LGS Türkçe",
      subject: "Türkçe",
      totalTests: 40,
      assignments: {
        create: [
          {
            startTest: 12,
            endTest: 16,
            dueDate: new Date("2026-03-10"),
            status: "done",
            score: "48/60",
          },
          {
            startTest: 17,
            endTest: 19,
            dueDate: new Date("2026-03-14"),
            status: "pending",
          },
        ],
      },
    },
  });
  void resource;

  await prisma.resourceTracker.create({
    data: {
      studentId: students[0].id,
      publisher: "Orijinal",
      bookName: "Matematik Branş",
      subject: "Matematik",
      totalTests: 50,
      assignments: {
        create: [
          {
            startTest: 5,
            endTest: 8,
            dueDate: new Date("2026-03-12"),
            status: "remedial",
          },
        ],
      },
    },
  });

  await prisma.zumreNote.create({
    data: {
      teacherId: teacher.id,
      content: "Bu hafta üslü ifadeler tekrar edilecek. Risk grubu: Ali, Can.",
    },
  });

  const kazanimlar = [
    { code: "M.8.1.1.1", title: "Üslü İfadeler", masteryPct: 42, status: "critical", subject: "Matematik" },
    { code: "M.8.1.1.3", title: "Köklü İfadeler", masteryPct: 68, status: "progress", subject: "Matematik" },
    { code: "M.8.2.1.1", title: "Çarpanlara Ayırma", masteryPct: 88, status: "done", subject: "Matematik" },
    { code: "M.8.3.1.2", title: "Olasılık", masteryPct: 55, status: "progress", subject: "Matematik" },
    { code: "F.8.1.1.1", title: "Mevsimler ve İklim", masteryPct: 74, status: "done", subject: "Fen" },
    { code: "T.8.3.2", title: "Noktalama İşaretleri", masteryPct: 91, status: "done", subject: "Türkçe" },
  ];

  for (const k of kazanimlar) {
    await prisma.kazanimProgress.create({
      data: { ...k, classId: klass.id, weekLabel: "Hafta 8" },
    });
  }

  const schools = [
    {
      name: "İstanbul Fen Lisesi",
      type: "Fen Lisesi",
      city: "İstanbul",
      district: "Beşiktaş",
      years: [
        { year: 2025, minScore: 478.2, maxScore: 500, quota: 96, percentile: 0.15 },
        { year: 2024, minScore: 475.1, maxScore: 500, quota: 96, percentile: 0.18 },
        { year: 2023, minScore: 472.0, maxScore: 500, quota: 90, percentile: 0.2 },
        { year: 2022, minScore: 470.5, maxScore: 500, quota: 90, percentile: 0.22 },
        { year: 2021, minScore: 468.0, maxScore: 500, quota: 90, percentile: 0.25 },
      ],
    },
    {
      name: "Kabataş Erkek Lisesi",
      type: "Anadolu Lisesi",
      city: "İstanbul",
      district: "Beşiktaş",
      years: [
        { year: 2025, minScore: 455.4, maxScore: 490, quota: 180, percentile: 0.8 },
        { year: 2024, minScore: 452.0, maxScore: 488, quota: 180, percentile: 0.9 },
        { year: 2023, minScore: 448.5, maxScore: 485, quota: 170, percentile: 1.0 },
        { year: 2022, minScore: 445.0, maxScore: 482, quota: 170, percentile: 1.1 },
        { year: 2021, minScore: 442.0, maxScore: 480, quota: 170, percentile: 1.2 },
      ],
    },
    {
      name: "Cağaloğlu Anadolu Lisesi",
      type: "Anadolu Lisesi",
      city: "İstanbul",
      district: "Fatih",
      years: [
        { year: 2025, minScore: 448.0, maxScore: 480, quota: 150, percentile: 1.2 },
        { year: 2024, minScore: 445.0, maxScore: 478, quota: 150, percentile: 1.3 },
        { year: 2023, minScore: 442.0, maxScore: 475, quota: 140, percentile: 1.4 },
        { year: 2022, minScore: 438.0, maxScore: 472, quota: 140, percentile: 1.5 },
        { year: 2021, minScore: 435.0, maxScore: 470, quota: 140, percentile: 1.6 },
      ],
    },
    {
      name: "Beşiktaş Anadolu Lisesi",
      type: "Anadolu Lisesi",
      city: "İstanbul",
      district: "Beşiktaş",
      years: [
        { year: 2025, minScore: 420.0, maxScore: 460, quota: 200, percentile: 3.5 },
        { year: 2024, minScore: 418.0, maxScore: 458, quota: 200, percentile: 3.6 },
        { year: 2023, minScore: 415.0, maxScore: 455, quota: 190, percentile: 3.8 },
        { year: 2022, minScore: 412.0, maxScore: 452, quota: 190, percentile: 4.0 },
        { year: 2021, minScore: 410.0, maxScore: 450, quota: 190, percentile: 4.2 },
      ],
    },
  ];

  for (const sch of schools) {
    await prisma.school.create({
      data: {
        name: sch.name,
        type: sch.type,
        city: sch.city,
        district: sch.district,
        yearData: { create: sch.years },
      },
    });
  }

  console.log("Seed OK");
  console.log("Login: selim@lgs.local / ogretmen123");
  console.log(`Active exam: ${exam.name} (${exam.id})`);
  console.log(`Form links created for ${students.length} students`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
