import Header from "@/components/Header";
import ItemForm from "@/components/ItemForm";
import { createItem } from "@/app/actions";

export const dynamic = "force-dynamic";

export default function NewItemPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-content px-6 py-8">
        <h1 className="mb-8 text-xl font-semibold text-ink">إضافة عنصر</h1>
        <ItemForm action={createItem} submitLabel="حفظ" />
      </main>
    </>
  );
}
