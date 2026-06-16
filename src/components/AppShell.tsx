import Sidebar from "./Sidebar";
import ClientShell from "./ClientShell";

/**
 * هيكل التطبيق بطراز Notion: الشريط على اليسار + المحتوى يمينه.
 * التخطيط المتجاوب في ClientShell (درج على الجوّال، ثابت على md+).
 * يُمرَّر الشريط (مكوّن خادم async) كـ prop فيبقى مُصيَّراً على الخادم.
 */
export default function AppShell({
  children,
  activeType,
  activeAuthor,
  nav,
}: {
  children: React.ReactNode;
  activeType?: string;
  activeAuthor?: string;
  nav?: string;
}) {
  return (
    <ClientShell
      sidebar={
        <Sidebar activeType={activeType} activeAuthor={activeAuthor} nav={nav} />
      }
    >
      {children}
    </ClientShell>
  );
}
