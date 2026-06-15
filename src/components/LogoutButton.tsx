"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="flex rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-ink disabled:opacity-50"
      title="تسجيل الخروج"
      aria-label="تسجيل الخروج"
    >
      <LogOut size={16} strokeWidth={1.75} />
    </button>
  );
}
