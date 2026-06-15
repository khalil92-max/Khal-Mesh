"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "تعذّر تسجيل الدخول.");
        setLoading(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-card border border-line bg-bg p-8 shadow-card"
    >
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
          خ
        </span>
        <span className="text-lg font-semibold text-ink">KhalMesh</span>
      </div>

      <h1 className="mb-1 text-xl font-semibold text-ink">أهلاً بعودتك</h1>
      <p className="mb-7 text-sm text-muted">أدخل رقمك السري للدخول.</p>

      <label
        htmlFor="password"
        className="mb-1.5 block text-xs font-medium text-muted"
      >
        كلمة المرور
      </label>
      <div className="flex items-center gap-2 rounded-md border border-line bg-bg px-3 py-2 shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        <Lock size={15} strokeWidth={1.75} className="shrink-0 text-faint" />
        <input
          id="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="mt-3 text-sm text-danger-strong">{error}</p>}

      <button
        type="submit"
        disabled={loading || password.length === 0}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-btn px-4 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-btn-hover disabled:opacity-50"
      >
        {loading ? "جارٍ التحقق…" : "دخول"}
        <ArrowLeft size={16} strokeWidth={2} />
      </button>
    </form>
  );
}
