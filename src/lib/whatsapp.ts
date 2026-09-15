export function buildParentMessage(data: {
  studentName: string;
  examName: string;
  net: number;
  score: number;
  percentile: number;
  reportUrl: string;
}): string {
  return (
    `Sayın veli,\n\n` +
    `${data.studentName} öğrencinizin *${data.examName}* sonuçları hazır.\n\n` +
    `Net: ${data.net} | Puan: ${data.score} | Dilim: %${data.percentile}\n\n` +
    `Detaylı rapor için: ${data.reportUrl}\n\n` +
    `_LGS Takip Sistemi_`
  );
}

export function whatsappUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "").replace(/^0/, "");
  const withCountry = cleaned.startsWith("90") ? cleaned : `90${cleaned}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
