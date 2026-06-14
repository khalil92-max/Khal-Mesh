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
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-2 text-faint">
        <Lock size={15} strokeWidth={1.75} />
        <span className="mono text-xs uppercase tracking-wide">private access</span>
      </div>

      <h1 className="mb-1 text-2xl font-semibold text-ink">KhalMesh</h1>
      <p className="mb-8 text-sm text-muted">
        أدخل رقمك السري للدخول.
      </p>

      <label htmlFor="password" className="mono mb-2 block text-xs text-faint">
        PASSWORD
      </label>
      <input
        id="password"
        type="password"
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border-b border-line-strong bg-transparent pb-2 text-lg text-ink outline-none transition-colors focus:border-accent"
        placeholder="••••••••"
      />

      {error && (
        <p className="mt-3 text-sm text-accent">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || password.length === 0}
        className="mt-8 flex items-center gap-2 text-sm font-medium text-ink transition-opacity hover:opacity-70 disabled:opacity-40"
      >
        {loading ? "جارٍ التحقق…" : "دخول"}
        <ArrowLeft size={16} strokeWidth={1.75} />
      </button>
    </form>
  );
}
