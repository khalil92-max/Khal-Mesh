import "server-only";
import { getServiceClient } from "./supabase";
import type { Module } from "./types";

export async function getModules(): Promise<Module[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Module[]) ?? [];
}

export async function getModule(id: string): Promise<Module | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Module) ?? null;
}

/** نسبة إنجاز شخصٍ من إجمالي الموديولات. */
export function progressFor(
  modules: Module[],
  person: string
): { done: number; total: number; pct: number } {
  const total = modules.length;
  const done = modules.filter((m) => m.completed_by?.includes(person)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}
