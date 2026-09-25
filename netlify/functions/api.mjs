import { getStore } from "@netlify/blobs";

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json" } });
const isOwner = req => { const k = Netlify.env.get("ADMIN_PASSWORD"); return !!k && req.headers.get("x-admin-key") === k; };
const clip = s => String(s || "").slice(0, 200);

export default async (req) => {
  const path = new URL(req.url).pathname.replace(/^\/api\//, "");
  const orders = getStore("orders"), stockStore = getStore("stock"), expenseStore = getStore("expenses");
  const getStock = async () => (await stockStore.get("levels", { type: "json" })) || {};

  // Public: stock levels
  if (path === "stock" && req.method === "GET") return json(await getStock());

  // Public: place an order (prices and stock are checked on the server)
  if (path === "order" && req.method === "POST") {
    const b = await req.json();
    const catalog = await (await fetch(new URL("/products.json", req.url))).json();
    const stock = await getStock();
    const items = []; let total = 0;
    for (const it of (b.items || []).slice(0, 50)) {
      const p = catalog.products.find(x => x.id == it.id);
      const qty = Math.floor(Number(it.qty));
      if (!p || !(qty > 0) || p.inStock === false) return json({ error: `${p ? p.name : "An item"} is not available` }, 409);
      if (stock[p.id] !== undefined && stock[p.id] < qty) return json({ error: `Only ${stock[p.id]} of ${p.name} left` }, 409);
      items.push({ id: p.id, name: p.name, price: p.price, qty });
      total += p.price * qty;
    }
    if (!items.length) return json({ error: "Your list is empty" }, 400);
    for (const i of items) if (stock[i.id] !== undefined) stock[i.id] -= i.qty;
    await stockStore.setJSON("levels", stock);
    const id = new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    await orders.setJSON(id, {
      id, time: new Date().toISOString(), items, total: Math.round(total * 100) / 100,
      mode: b.mode === "Delivery" ? "Delivery" : "Pickup",
      name: clip(b.name), address: clip(b.address), payment: clip(b.payment), tid: clip(b.tid), status: /jazzcash|easypaisa|wallet/i.test(b.payment || "") ? "Awaiting payment check" : "New"
    });
    return json({ orderId: id, total });
  }

  // Public: one order's receipt
  if (path.startsWith("receipt/") && req.method === "GET") {
    const o = await orders.get(path.slice(8), { type: "json" });
    return o ? json(o) : json({ error: "Order not found" }, 404);
  }

  // Everything below is for the owner only
  if (!isOwner(req)) return json({ error: "Wrong password" }, 401);

  if (path === "expenses" && req.method === "GET") {
    const { blobs } = await expenseStore.list();
    const all = await Promise.all(blobs.map(b => expenseStore.get(b.key, { type: "json" })));
    return json(all.filter(Boolean).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 300));
  }
  if (path === "expenses" && req.method === "POST") {
    const b = await req.json();
    const amount = Number(b.amount);
    if (!(amount > 0)) return json({ error: "Enter a valid amount" }, 400);
    const id = new Date().toISOString().slice(0, 19).replace(/\D/g, "");
    await expenseStore.setJSON(id, { id, time: new Date().toISOString(), label: clip(b.label || "Expense"), amount });
    return json({ ok: true });
  }
  if (path.startsWith("expenses/") && req.method === "DELETE") {
    await expenseStore.delete(path.slice(9));
    return json({ ok: true });
  }

  if (path === "orders" && req.method === "GET") {
    const { blobs } = await orders.list();
    const all = await Promise.all(blobs.map(b => orders.get(b.key, { type: "json" })));
    return json(all.filter(Boolean).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 300));
  }
  if (path === "status" && req.method === "POST") {
    const { id, status } = await req.json();
    if (!["New", "Awaiting payment check", "Paid", "Ready", "Done", "Cancelled"].includes(status)) return json({ error: "Bad status" }, 400);
    const o = await orders.get(String(id), { type: "json" });
    if (!o) return json({ error: "Order not found" }, 404);
    if (o.status === "Cancelled") return json({ error: "Cancelled orders cannot be reopened" }, 409);
    if (status === "Cancelled") { // put the items back in stock
      const stock = await getStock();
      for (const i of o.items) if (stock[i.id] !== undefined) stock[i.id] += i.qty;
      await stockStore.setJSON("levels", stock);
    }
    o.status = status;
    await orders.setJSON(o.id, o);
    return json({ ok: true });
  }
  if (path === "stock" && req.method === "POST") {
    const { levels } = await req.json();
    await stockStore.setJSON("levels", levels || {});
    return json({ ok: true });
  }
  return json({ error: "Not found" }, 404);
};

export const config = { path: "/api/*" };
