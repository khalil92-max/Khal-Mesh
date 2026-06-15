import Sidebar from "./Sidebar";

/**
 * هيكل التطبيق بطراز Notion: الشريط الجانبي على اليسار + منطقة المحتوى
 * تملأ البقية على اليمين. في RTL مع flex، أول عنصر (المحتوى) يبدأ من
 * اليمين ويتمدّد، والشريط ذو العرض الثابت يستقرّ على أقصى اليسار.
 */
export default function AppShell({
  children,
  activeType,
  activeAuthor,
}: {
  children: React.ReactNode;
  activeType?: string;
  activeAuthor?: string;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      <Sidebar activeType={activeType} activeAuthor={activeAuthor} />
    </div>
  );
}
