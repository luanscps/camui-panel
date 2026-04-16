import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const MOBILEAPI_KEY = Deno.env.get("MOBILEAPI_KEY") ?? "";
const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")  ?? "";
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BUCKET        = "phone-images";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b: any) => b.name === BUCKET);
  if (!exists) await supabase.storage.createBucket(BUCKET, { public: true });
}

/**
 * Tenta buscar o device na MobileAPI com múltiplas estratégias:
 * 1. brand + model (nome comercial: Build.MANUFACTURER + Build.MODEL)
 * 2. Somente brand + model sem o codename
 * 3. Fallback: só model
 */
async function searchDevice(brand: string, model: string) {
  const queries = [
    `${brand} ${model}`,
    model,
    brand,
  ];

  for (const q of queries) {
    const res = await fetch(
      `https://api.mobileapi.dev/v1/devices/search?name=${encodeURIComponent(q)}&limit=5`,
      { headers: { "X-Api-Key": MOBILEAPI_KEY } }
    );
    if (!res.ok) continue;
    const json = await res.json();
    const devices: any[] = json.devices ?? json.data ?? (Array.isArray(json) ? json : []);
    if (devices.length) {
      return devices.sort((a: any, b: any) => (b.match_certainty ?? 0) - (a.match_certainty ?? 0))[0];
    }
  }
  return null;
}

async function getDeviceDetail(deviceId: number) {
  const res = await fetch(`https://api.mobileapi.dev/v1/devices/${deviceId}`, {
    headers: { "X-Api-Key": MOBILEAPI_KEY },
  });
  if (!res.ok) return null;
  return await res.json();
}

async function uploadImage(imageUrl: string, slug: string): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = await imgRes.arrayBuffer();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${slug}.png`, buffer, { contentType: "image/png", upsert: true });
    if (error) { console.error("Storage upload:", error); return null; }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${slug}.png`);
    return data?.publicUrl ?? null;
  } catch (e) {
    console.error("uploadImage:", e);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });

  let body: {
    device_activation_id?: string;
    device_brand?: string;
    device_model?: string;
    device_name?: string;
  };
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

  const { device_activation_id, device_brand, device_model, device_name } = body;
  if (!device_activation_id || (!device_brand && !device_model && !device_name))
    return new Response(JSON.stringify({ error: "device_activation_id e pelo menos brand/model/name são obrigatórios" }), { status: 400 });

  try {
    await ensureBucket();

    // Usa device_name (nome comercial) se disponível, senão brand + model
    const searchBrand = device_brand ?? "";
    const searchModel = device_name ?? device_model ?? "";

    const found = await searchDevice(searchBrand, searchModel);
    if (!found) {
      console.warn(`Device não encontrado: brand=${device_brand} model=${device_model} name=${device_name}`);
      return new Response(JSON.stringify({ ok: false, message: "Device não encontrado na MobileAPI" }), { status: 200 });
    }

    const deviceId = found.id ?? found.device_id;
    const detail   = await getDeviceDetail(deviceId);

    const rawImageUrl: string | null =
      detail?.images?.[0]?.url ??
      detail?.image_url ??
      found?.image_url ??
      found?.thumbnail ??
      null;

    const specs = {
      display:  detail?.display?.size     ?? detail?.specs?.display  ?? null,
      camera:   detail?.camera?.main      ?? detail?.specs?.camera   ?? null,
      battery:  detail?.battery?.capacity ?? detail?.specs?.battery  ?? null,
      ram:      detail?.memory?.ram       ?? detail?.specs?.ram      ?? null,
      storage:  detail?.memory?.internal  ?? detail?.specs?.storage  ?? null,
      chipset:  detail?.platform?.chipset ?? detail?.specs?.chipset  ?? null,
      os:       detail?.software?.os      ?? detail?.specs?.os       ?? null,
    };

    const slug      = slugify(`${device_brand ?? searchModel}-${device_model ?? searchModel}`);
    const publicUrl = rawImageUrl ? await uploadImage(rawImageUrl, slug) : null;

    const { error: updateErr } = await supabase
      .from("device_activations")
      .update({ phone_image_url: publicUrl, mobileapi_device_id: deviceId, phone_specs: specs })
      .eq("id", device_activation_id);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ ok: true, phone_image_url: publicUrl, specs, mobileapi_device_id: deviceId }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("sync-phone-image error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
});
