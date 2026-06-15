// تقويم مصغّر بطراز Notion Calendar — يعرض الشهر الحالي ويميّز اليوم.
// مكوّن خادم: يحسب التاريخ وقت الطلب (الصفحات force-dynamic).

const WEEKDAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"]; // الأحد → السبت

export default function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const firstWeekday = new Date(year, month, 1).getDay(); // 0=أحد
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  // 42 خلية (6 أسابيع) تشمل ذيل الشهر السابق ورأس التالي
  const cells: { day: number; inMonth: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  for (let d = 1; cells.length < 42; d++) {
    cells.push({ day: d, inMonth: false });
  }

  const monthName = new Intl.DateTimeFormat("ar", { month: "long" }).format(now);

  return (
    <div className="select-none px-1">
      <div className="mb-2 px-1.5 text-sm font-semibold text-ink">
        {monthName} <span className="tnum text-muted">{year}</span>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[10px] font-medium text-muted">
            {w}
          </span>
        ))}
        {cells.map((c, i) => {
          const isToday = c.inMonth && c.day === todayDate;
          return (
            <span
              key={i}
              className={
                "tnum mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[11px] " +
                (isToday
                  ? "bg-today font-semibold text-white"
                  : c.inMonth
                    ? "text-ink"
                    : "text-faint")
              }
            >
              {c.day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
