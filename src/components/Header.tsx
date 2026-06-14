import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-5">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-lg font-semibold text-ink">
            KhalMesh
          </Link>
          {user && (
            <span className="mono text-xs text-faint">— {user}</span>
          )}
        </div>

        <nav className="flex items-center gap-5">
          <Link
            href="/new"
            className="flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            <Plus size={16} strokeWidth={1.75} />
            إضافة
          </Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
