import { getStore } from "@netlify/blobs";

const TURNOS = ["manana", "tarde", "noche"];

export default async (req) => {
  const url = new URL(req.url);
  const turno = (url.searchParams.get("turno") || "").toLowerCase();
  if (!TURNOS.includes(turno)) {
    return Response.json({ error: "turno no valido" }, { status: 400 });
  }

  const store = getStore({ name: "checklists-edar", consistency: "strong" });
  const key = turno + "/registros.json";

  if (req.method === "POST") {
    let payload = null;
    try {
      payload = await req.json();
    } catch (e) {
      payload = null;
    }
    const entradas = Array.isArray(payload)
      ? payload
      : payload && Array.isArray(payload.registros)
        ? payload.registros
        : [];
    if (entradas.length === 0) {
      return Response.json({ error: "sin registros" }, { status: 400 });
    }

    const actuales = await store.get(key, { type: "json" });
    const lista = Array.isArray(actuales) ? actuales : [];
    entradas.forEach((r) => {
      if (!r || !r.id) return;
      const i = lista.findIndex((x) => x && x.id === r.id);
      if (i === -1) {
        lista.push(r);
        return;
      }
      const prev = lista[i];
      if (!prev.timestamp || (r.timestamp && r.timestamp >= prev.timestamp)) {
        lista[i] = r;
      }
    });
    lista.sort((a, b) => {
      const f = String(a.fecha || "").localeCompare(String(b.fecha || ""));
      if (f !== 0) return f;
      return String(a.timestamp || "").localeCompare(String(b.timestamp || ""));
    });
    await store.setJSON(key, lista);
    return Response.json({ registros: lista });
  }

  const lista = await store.get(key, { type: "json" });
  return Response.json({ registros: Array.isArray(lista) ? lista : [] });
};

export const config = {
  path: "/api/datos",
};
