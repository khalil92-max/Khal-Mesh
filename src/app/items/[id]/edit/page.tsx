import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ItemForm from "@/components/ItemForm";
import { updateItem } from "@/app/actions";
import { getItem } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const action = updateItem.bind(null, id);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-content px-6 py-8">
        <h1 className="mb-8 text-xl font-semibold text-ink">تعديل عنصر</h1>
        <ItemForm action={action} item={item} submitLabel="تحديث" />
      </main>
    </>
  );
}
