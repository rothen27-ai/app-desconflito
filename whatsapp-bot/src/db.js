// Acesso ao Supabase. Cada função faz uma coisa e devolve dados simples,
// pra manter o resto do código sem saber que existe SQL por baixo.
import { createClient } from "@supabase/supabase-js";
import { randomInt } from "node:crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// ─── Usuários ─────────────────────────────────────────────
export async function getUser(phone) {
  const { data } = await supabase.from("users").select("*").eq("phone", phone).maybeSingle();
  return data;
}

export async function createUser(phone) {
  const { data } = await supabase
    .from("users")
    .insert({ phone, state: "new" })
    .select()
    .single();
  return data;
}

export async function updateUser(phone, fields) {
  const { data } = await supabase.from("users").update(fields).eq("phone", phone).select().single();
  return data;
}

// ─── Mensagens (memória da conversa) ──────────────────────
export async function addMessage(phone, role, content) {
  await supabase.from("messages").insert({ phone, role, content });
}

// Últimas N mensagens em ordem cronológica, prontas pra API do Claude.
export async function getRecentMessages(phone, limit = 20) {
  const { data } = await supabase
    .from("messages")
    .select("role, content")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).reverse().map(({ role, content }) => ({ role, content }));
}

export async function countUserMessages(phone) {
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("phone", phone)
    .eq("role", "user");
  return count ?? 0;
}

// ─── Resumos (contexto interno do parceiro) ───────────────
export async function upsertSummary(phone, summary) {
  await supabase
    .from("summaries")
    .upsert({ phone, summary, updated_at: new Date().toISOString() });
}

export async function getSummary(phone) {
  const { data } = await supabase.from("summaries").select("summary").eq("phone", phone).maybeSingle();
  return data?.summary ?? null;
}

// ─── Pareamento de casal ──────────────────────────────────
export async function createCoupleFor(phone) {
  const code = String(randomInt(100000, 1000000)); // 6 dígitos
  const { data: couple } = await supabase
    .from("couples")
    .insert({ pairing_code: code })
    .select()
    .single();
  await updateUser(phone, { couple_id: couple.id });
  return code;
}

export async function joinCoupleByCode(phone, code) {
  const { data: couple } = await supabase
    .from("couples")
    .select("id")
    .eq("pairing_code", code.trim())
    .maybeSingle();
  if (!couple) return { ok: false, reason: "not_found" };

  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", couple.id);
  if ((count ?? 0) >= 2) return { ok: false, reason: "full" };

  await updateUser(phone, { couple_id: couple.id });
  return { ok: true };
}

// Telefone do parceiro (o outro usuário no mesmo casal), ou null.
export async function getPartnerPhone(phone, coupleId) {
  if (!coupleId) return null;
  const { data } = await supabase
    .from("users")
    .select("phone")
    .eq("couple_id", coupleId)
    .neq("phone", phone);
  return data?.[0]?.phone ?? null;
}
