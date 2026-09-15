"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen bg-white">
      {/* Sol panel */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-slate-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <span className="material-symbols-outlined text-[17px] text-white">school</span>
          </div>
          <span className="text-[15px] font-bold text-white">LGS Portal</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">2026 LGS Hazırlık</span>
            </div>
            <h1 className="text-[38px] font-bold leading-tight tracking-tight text-white">
              Öğrencilerinizin<br />
              LGS yolculuğunu<br />
              <span className="text-secondary">birlikte izleyin.</span>
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-white/50 max-w-sm">
              Deneme takibi, yanlış soru galerisi, veli raporları ve hedef lise analizi — tek platformda.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { icon: "quiz", text: "Anlık yanlış soru galerisi" },
              { icon: "groups", text: "Öğrenci & veli WhatsApp raporları" },
              { icon: "school", text: "Hedef lise uyumluluk analizi" },
            ].map((f) => (
              <div key={f.icon} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8">
                  <span className="material-symbols-outlined text-[14px] text-secondary">{f.icon}</span>
                </div>
                <span className="text-[13px] text-white/60">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/20">MEB 2025 müfredatı · Ücretsiz</p>
      </div>

      {/* Sağ panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <span className="material-symbols-outlined text-[17px] text-white">school</span>
          </div>
          <p className="text-[17px] font-bold text-slate-900">LGS Portal</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tekrar hoş geldiniz</h2>
            <p className="mt-1 text-sm text-slate-500">Öğretmen hesabınızla giriş yapın</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">E-posta</label>
              <Input
                name="email"
                type="email"
                required
                defaultValue="selim@lgs.local"
                className="h-11 text-sm rounded-xl"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Şifre</label>
              <Input
                name="password"
                type="password"
                required
                defaultValue="ogretmen123"
                className="h-11 text-sm rounded-xl"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <span className="material-symbols-outlined text-[15px] text-red-500">error</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="mt-2 h-11 w-full text-sm rounded-xl">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Demo Hesap</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[13px] text-secondary">mail</span>
                <code className="text-[13px] text-slate-700">selim@lgs.local</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[13px] text-secondary">lock</span>
                <code className="text-[13px] text-slate-700">ogretmen123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
