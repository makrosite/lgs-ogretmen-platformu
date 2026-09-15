"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) { setError("E-posta veya şifre hatalı"); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Sol panel — branded */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-primary-container p-12 relative overflow-hidden">
        {/* Dekoratif daireler */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-on-tertiary-container/10 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary shadow-lg">
            <span className="material-symbols-outlined text-[20px] text-on-secondary">school</span>
          </div>
          <div>
            <p className="text-[15px] font-bold leading-tight text-on-primary-container">LGS Portal</p>
            <p className="text-[11px] text-on-primary-container/60">Öğretmen Paneli</p>
          </div>
        </div>

        {/* Ana içerik */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-on-tertiary-container animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-primary-container/70">
              2026 LGS Hazırlık Dönemi
            </span>
          </div>
          <h1 className="text-[36px] font-bold leading-tight tracking-tight text-on-primary-container">
            Öğrencilerinizin<br />
            LGS yolculuğunu<br />
            <span className="text-secondary-fixed-dim">birlikte izleyin.</span>
          </h1>
          <p className="text-[14px] leading-relaxed text-on-primary-container/60 max-w-sm">
            Deneme takibi, yanlış soru galerisi, veli raporları ve hedef lise analizi — tek platformda.
          </p>

          {/* Özellik listesi */}
          <div className="space-y-3 pt-2">
            {[
              { icon: "quiz", text: "Anlık yanlış soru galerisi" },
              { icon: "groups", text: "Öğrenci & veli WhatsApp raporları" },
              { icon: "school", text: "Hedef lise uyumluluk analizi" },
            ].map((f) => (
              <div key={f.icon} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/20">
                  <span className="material-symbols-outlined text-[15px] text-secondary-fixed-dim">{f.icon}</span>
                </div>
                <span className="text-[13px] text-on-primary-container/70">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alt */}
        <p className="relative z-10 text-[11px] text-on-primary-container/30">
          MEB 2025 müfredatı · Ücretsiz
        </p>
      </div>

      {/* Sağ panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-surface px-8 py-12">
        {/* Mobil logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
            <span className="material-symbols-outlined text-[20px] text-on-secondary">school</span>
          </div>
          <p className="text-[17px] font-bold text-on-surface">LGS Portal</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-[24px] font-bold leading-tight tracking-tight text-on-surface">
              Tekrar hoş geldiniz
            </h2>
            <p className="mt-1 text-[13px] text-on-surface-variant">
              Öğretmen hesabınızla giriş yapın
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface-variant">
                E-posta
              </label>
              <input
                name="email"
                type="email"
                required
                defaultValue="selim@lgs.local"
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-[14px] text-on-surface outline-none transition-all placeholder:text-outline focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-on-surface-variant">
                Şifre
              </label>
              <input
                name="password"
                type="password"
                required
                defaultValue="ogretmen123"
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-[14px] text-on-surface outline-none transition-all placeholder:text-outline focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error-container px-3 py-2">
                <span className="material-symbols-outlined text-[15px] text-error">error</span>
                <p className="text-[12px] text-on-error-container">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-[14px] font-semibold text-on-secondary shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-secondary/30 border-t-on-secondary" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Demo Hesap</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[13px] text-secondary">mail</span>
                <code className="text-[12px] text-on-surface">selim@lgs.local</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[13px] text-secondary">lock</span>
                <code className="text-[12px] text-on-surface">ogretmen123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
