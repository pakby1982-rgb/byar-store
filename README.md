# BYAR GENERAL STORE — Agile build

## Deploy (Netlify)
1. Drag this folder onto https://app.netlify.com/drop, or push it to GitHub and "Import from Git".
2. No build command needed. Publish directory: `.`

## Set up before launch
- `index.html`: set your WhatsApp number and currency in the `STORE` block.
- `products.json`: edit items, prices, `inStock` (true/false), photo `image` (a file in this folder, e.g. `"rice.jpg"`), plus hours, address and phone.
- Test locally with `npx serve` (products.json will not load from a double-clicked file).

## Agile board
**Product goal:** customers browse BYAR GENERAL STORE and send an order in under a minute.

### Sprint 1 (done): "Browse and order"
- [x] Product catalog with categories
- [x] Search
- [x] Shopping list with quantities and total
- [x] Order by WhatsApp
- [x] Netlify config, mobile layout, dark mode

### Sprint 2 (done): "Run it without code"
- [x] Products, hours and address in `products.json`
- [x] Product photos (with letter placeholder)
- [x] In-stock / out-of-stock flag
- [x] Store hours and location section

### Sprint 3 (done): "Owner edit screen"
- [x] Decap CMS at `/admin` to edit products, stock, photos, hours

#### Turn on /admin (one-time)
1. Put this folder in a GitHub repo and deploy it from Git on Netlify (drag-and-drop cannot save edits).
2. In `admin/config.yml`, set `repo:` to `your-username/your-repo`.
3. Netlify: Site configuration > Access & security > OAuth > install the GitHub provider.
4. Open `yoursite.netlify.app/admin`, log in with GitHub. The editor needs a GitHub account with write access to the repo. Each save commits to the repo and Netlify redeploys.

Note: Netlify Identity/Git Gateway (the no-GitHub-account route) is deprecated, so it is not used here.

### Sprint 4 (done): "Better orders"
- [x] Delivery or pickup choice, name and address in the WhatsApp order

### Sprint 5 (done): "Payment"
- [x] Payment method choice in the order (cash, transfer, optional card link)
- [x] Optional online payment link: create a Payment Link in Stripe, PayPal or a local provider, paste its https URL into `payLink` in `products.json` (or in /admin). A "Pay online (card)" option then appears.

### Sprint 6 (done): "Orders, stock and sales"
- [x] Orders are saved on the server (Netlify Functions + Netlify Blobs) with an order number
- [x] Stock counts drop automatically when an order is placed; "only N left" and "Out of stock" show on the shop
- [x] Owner page at `/owner`: order list with status (New, Paid, Ready, Done, Cancelled), sales report, low-stock list, stock editor
- [x] Cancelling an order puts the items back in stock

#### Turn on the server modules (one time)
1. Deploy from Git (Netlify builds the function; drag-and-drop does not).
2. Netlify: Site configuration > Environment variables > add `ADMIN_PASSWORD` (your owner password), then redeploy.
3. Open `yoursite.netlify.app/owner` and log in.
Without these steps the shop still works and orders still go to WhatsApp; they just are not saved.

### Sprint 10 (done): "Urdu / English"
- [x] Language switch button (top right) toggles the whole shop between English and Urdu, right-to-left layout included
- [x] Product names and categories in Urdu, from `name_ur` / `cat_ur` in `products.json`
- [x] Remembers the visitor's last chosen language

New products added later need a `name_ur` and `cat_ur` field in `products.json` (or via `/admin`) or they'll just show the English name in Urdu mode.

### Sprint 9 (done): "SEO and share previews"
- [x] Page title, meta description, Open Graph and Twitter Card tags so a link to the store shows a title, description and cover photo when pasted into WhatsApp, Facebook, etc.
- [x] Store icon (favicon) and theme color for the browser tab
- [x] `robots.txt` and `sitemap.xml` for search engines; `/owner` and `/admin` are excluded from indexing
- [x] Structured data (schema.org) so Google can show it as a local store listing

#### Before this works fully
1. Add a real photo of your shop or products as `images/og-cover.jpg` (1200x630px) — this is what shows in shared links.
2. Once deployed, replace `byar-general-store.netlify.app` everywhere in `index.html`, `robots.txt` and `sitemap.xml` with your real Netlify or custom domain.

### Sprint 7 (in progress): "Money out, and receipts"
- [x] Expenses tab in `/owner`: log purchases/rent/etc, see them listed
- [x] Profit shown on the Sales tab (sales minus expenses)
- [x] Printable customer receipt at `/receipt.html?id=ORDERID`, linked from each order in `/owner`
- [x] "Export orders CSV" and "Export expenses CSV" buttons in `/owner` — opens straight in Excel/Sheets for bookkeeping or a tax return
- [x] JazzCash / Easypaisa at checkout: customer pays to your wallet number, then enters the transaction ID; the order is flagged "Awaiting payment check" so you know to verify it before marking Paid in `/owner`.

Full *automatic* confirmation needs a registered merchant account with a gateway or aggregator (e.g. Simpaisa, JazzCash/Easypaisa direct), which usually takes a business registration and a few weeks' approval — worth doing once order volume justifies it. Until then, put your JazzCash/Easypaisa number in `products.json` under `payment.transferNote` so customers know where to send money.
- [ ] Customer accounts, barcode scanning (later, bigger sprints)

### Each sprint
Plan (1 hr) → build (1 week) → demo to the shop owner → retrospective → update this board.
