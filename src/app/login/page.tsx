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
    if (res?.error) {
      setError("E-posta veya şifre hatalı");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
        <div className="mb-space-lg flex items-center gap-space-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-on-secondary">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="font-headline-md text-on-surface">LGS Portal</h1>
            <p className="font-body-sm text-on-surface-variant">Öğretmen girişi</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-space-md">
          <div>
            <label className="mb-1 block font-label-md text-on-surface-variant">E-posta</label>
            <input
              name="email"
              type="email"
              required
              defaultValue="selim@lgs.local"
              className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 font-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <div>
            <label className="mb-1 block font-label-md text-on-surface-variant">Şifre</label>
            <input
              name="password"
              type="password"
              required
              defaultValue="ogretmen123"
              className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 font-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          {error && <p className="font-body-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-secondary py-space-sm font-label-lg text-on-secondary hover:bg-secondary-container disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
        <p className="mt-space-md font-body-sm text-on-surface-variant">
          Demo: selim@lgs.local / ogretmen123
        </p>
      </div>
    </div>
  );
}
