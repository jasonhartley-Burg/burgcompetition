const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

async function body(request) {
  try { return await request.json(); } catch { return {}; }
}

async function getMenu(env, includeInactive = false) {
  const categoryWhere = includeInactive ? '' : 'WHERE active = 1';
  const itemWhere = includeInactive ? '' : 'WHERE active = 1';
  const cats = await env.MENU_DB.prepare(`SELECT * FROM categories ${categoryWhere} ORDER BY display_order, id`).all();
  const items = await env.MENU_DB.prepare(`SELECT * FROM menu_items ${itemWhere} ORDER BY category_id, display_order, id`).all();
  const byCategory = new Map();
  for (const item of items.results || []) {
    if (!byCategory.has(item.category_id)) byCategory.set(item.category_id, []);
    byCategory.get(item.category_id).push(item);
  }
  return (cats.results || []).map(c => ({ ...c, items: byCategory.get(c.id) || [] }));
}

async function api(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/menu' && method === 'GET') {
    return json({ categories: await getMenu(env, false), updatedAt: new Date().toISOString() });
  }

  if (path === '/api/admin/menu' && method === 'GET') {
    return json({ categories: await getMenu(env, true) });
  }

  if (!path.startsWith('/api/admin/')) return json({ error: 'Not found' }, 404);

  if (path === '/api/admin/categories' && method === 'POST') {
    const b = await body(request);
    const name = String(b.name || '').trim();
    if (!name) return json({ error: 'Category name is required' }, 400);
    const order = Number.isFinite(Number(b.display_order)) ? Number(b.display_order) : 0;
    const result = await env.MENU_DB.prepare('INSERT INTO categories (name, display_order) VALUES (?, ?)').bind(name, order).run();
    return json({ success: true, id: result.meta.last_row_id }, 201);
  }

  const catMatch = path.match(/^\/api\/admin\/categories\/(\d+)$/);
  if (catMatch && method === 'PATCH') {
    const id = Number(catMatch[1]);
    const b = await body(request);
    const existing = await env.MENU_DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
    if (!existing) return json({ error: 'Category not found' }, 404);
    await env.MENU_DB.prepare(`UPDATE categories SET name=?, display_order=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(String(b.name ?? existing.name).trim(), Number(b.display_order ?? existing.display_order), Number(b.active ?? existing.active) ? 1 : 0, id).run();
    return json({ success: true });
  }

  if (catMatch && method === 'DELETE') {
    const id = Number(catMatch[1]);
    await env.MENU_DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    return json({ success: true });
  }

  if (path === '/api/admin/items' && method === 'POST') {
    const b = await body(request);
    const name = String(b.name || '').trim();
    const categoryId = Number(b.category_id);
    if (!name || !categoryId) return json({ error: 'Item name and category are required' }, 400);
    const priceCents = Math.max(0, Math.round(Number(b.price || 0) * 100));
    const result = await env.MENU_DB.prepare(`INSERT INTO menu_items (category_id,name,description,price_cents,display_order,active,sold_out) VALUES (?,?,?,?,?,?,?)`)
      .bind(categoryId, name, String(b.description || '').trim(), priceCents, Number(b.display_order || 0), b.active === false ? 0 : 1, b.sold_out ? 1 : 0).run();
    return json({ success: true, id: result.meta.last_row_id }, 201);
  }

  const itemMatch = path.match(/^\/api\/admin\/items\/(\d+)$/);
  if (itemMatch && method === 'PATCH') {
    const id = Number(itemMatch[1]);
    const b = await body(request);
    const e = await env.MENU_DB.prepare('SELECT * FROM menu_items WHERE id=?').bind(id).first();
    if (!e) return json({ error: 'Item not found' }, 404);
    let price = e.price_cents;
    if (b.price !== undefined) price = Math.max(0, Math.round(Number(b.price) * 100));
    await env.MENU_DB.prepare(`UPDATE menu_items SET category_id=?,name=?,description=?,price_cents=?,display_order=?,active=?,sold_out=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(Number(b.category_id ?? e.category_id), String(b.name ?? e.name).trim(), String(b.description ?? e.description).trim(), price, Number(b.display_order ?? e.display_order), Number(b.active ?? e.active) ? 1 : 0, Number(b.sold_out ?? e.sold_out) ? 1 : 0, id).run();
    return json({ success: true });
  }

  if (itemMatch && method === 'DELETE') {
    await env.MENU_DB.prepare('DELETE FROM menu_items WHERE id=?').bind(Number(itemMatch[1])).run();
    return json({ success: true });
  }

  const soldMatch = path.match(/^\/api\/admin\/items\/(\d+)\/sold-out$/);
  if (soldMatch && method === 'POST') {
    const id = Number(soldMatch[1]);
    const b = await body(request);
    await env.MENU_DB.prepare('UPDATE menu_items SET sold_out=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(b.sold_out ? 1 : 0, id).run();
    return json({ success: true });
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return api(request, env, url);
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return env.ASSETS.fetch(new Request(new URL('/admin.html', url), request));
    }
    return env.ASSETS.fetch(request);
  }
};
