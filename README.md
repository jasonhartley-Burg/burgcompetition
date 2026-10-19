# Burg Competition Concessions — separate event version

This is an **independent copy** of the BurgConcessions menu for Saturday, October 24, 2026. The original Worker and its D1 database are untouched.

## What changed
- New Worker name: `burg-competition-concessions` (intended public URL `https://burg-competition-concessions.<YOUR-CLOUDFLARE-SUBDOMAIN>.workers.dev/` after deployment). The actual URL is assigned by Cloudflare.
- Competition palette: INTERtwined 2026 purple, dark charcoal and teal, with the provided event artwork in the menu header.
- Existing full `/admin` page and all item/category, availability and sold-out tools retained.
- Removed the admin token input and bearer-token checks. **No separate app admin token is required.**
- New, independent D1 database must be created and configured.

## Important: secure the token-free admin before going live
The project no longer performs application-level admin authorization. **Without a Cloudflare Access policy or another trusted edge restriction, anyone who finds the `/admin` URL can modify the menu, and the `/api/admin/*` endpoints are publicly writable—even if `/admin` is hidden.** Protect **both** paths `.../admin*` AND `.../api/admin/*` with Cloudflare Zero Trust Access (identity login) or another appropriate edge authorization rule before exposing the Worker. Restrict access to designated organizers; do not treat a hidden URL as protection. Test with an unauthenticated browser.

## Deploy as a second Worker (do not overwrite the original)
1. Create a **new GitHub repository** or deploy from this directory as a second Worker.
2. Run `npm install` and `npx wrangler login`.
3. Run `npx wrangler d1 create burg-competition-concessions` and replace `REPLACE_WITH_NEW_COMPETITION_D1_DATABASE_ID` in `wrangler.jsonc` with the newly generated UUID. **Never use the original database ID.**
4. Run `npm run db:remote` to apply the three supplied migrations (same menu starting point as source copy).
5. Set up Cloudflare Access protections for `/admin*` and `/api/admin/*` on your chosen hostname before you advertise the URL. **The admin APIs must be covered, not just the web page.**
6. Run `npm run deploy`. Note the actual Cloudflare-assigned `workers.dev` URL.
7. Open `<new-worker-url>/` for the menu and `<new-worker-url>/admin` for management, then adjust Saturday's prices/items on the admin page.

**Note:** The copied migration `0002_real_menu.sql` replaces sample menu data during first initialization, like the original; `0003_add_sweet_treats.sql` preserves/restores Sweet Treats. Do not rerun `0002` manually after making live edits.


## October 19, 2026 visual update
- Public menu: removed the generic COMPETITION CONCESSIONS and secondary title bars; replaced with a centered, cropped INTERtwined event banner.
- Category panels: changed to ivory-white backgrounds with dark charcoal text and teal/violet accent headings.
- Admin page and database schema: unchanged.
- Wrangler worker name: `burgcompetition`; D1 binding uses the separate competition database.
- This project is intended for the **competition** repository only, not the original BurgConcessions project.
- IMPORTANT: The admin API must be protected via Cloudflare Access before publishing the URL. Do not rely on hiding `/admin` alone.
- Because the D1 database was already initialized, **do not rerun migration 0002_real_menu.sql**: it deletes current menu data.


## New high-resolution artwork update

The public header now uses a new high-resolution crop of the user-supplied `WideScreen_Front.png` at `public/intertwined-logo-banner.jpg`, centered with `object-fit: contain` to avoid distortion. The full supplied artwork is archived at `public/intertwined-widescreen-original.png`. The prior light menu cards, API and admin page remain unchanged. Existing D1 data is not modified on deployment; **do not rerun migrations**.


## v3 visual theme (2026-10-19)
The live public page now uses the provided transparent INTERtwined logo over a native CSS purple/teal backdrop, light readable cards, subtle atmospheric glow, and existing musical notes. All menu items remain API-driven, not baked into a picture. No D1 migration is required for this visual update. Worker name: burgcompetition. Admin API still needs access protection before public sharing.
