# Deploy BYAR GENERAL STORE — step by step

## 1. Get the code on GitHub
Drag-and-drop deploy won't work anymore (the owner dashboard and orders need a server function). So:
1. Create a free GitHub account if you don't have one: https://github.com/signup
2. Create a new repository (e.g. `byar-store`), set to Private or Public, no README.
3. Upload this whole `byar-store` folder into it — either:
   - GitHub's website: "Add file" > "Upload files", drag every file/folder in, commit.
   - Or with git: `git init && git add . && git commit -m "BYAR store" && git remote add origin <your-repo-url> && git push -u origin main`

## 2. Connect Netlify
1. Sign up free at https://app.netlify.com (you can sign in with GitHub).
2. "Add new site" > "Import an existing project" > choose GitHub > pick your `byar-store` repo.
3. Build command: leave blank. Publish directory: `.` (a dot). Click Deploy.
4. Netlify gives you a URL like `random-name-123.netlify.app`. You can rename it under Site configuration > Domain management > Options > Edit site name, or connect your own domain there later.

## 3. Turn on the owner dashboard
1. Site configuration > Environment variables > Add a variable: key `ADMIN_PASSWORD`, value = a password only you know.
2. Deploys > Trigger deploy > Deploy site (so the function picks up the new variable).
3. Open `yoursite.netlify.app/owner` and log in with that password.

## 4. Turn on the /admin product editor (optional but recommended)
1. In `admin/config.yml`, change `repo:` to `your-github-username/byar-store`, commit the change (edit on GitHub's website is fine).
2. Netlify: Site configuration > Access & security > OAuth > install the GitHub provider (one click, Netlify walks you through it).
3. Open `yoursite.netlify.app/admin`, log in with GitHub.

## 5. Fill in your real details
Edit these before sharing the link with customers:
- `index.html` → `STORE` block: your real WhatsApp number and currency.
- `products.json`: your real items, prices, stock, store hours, address, phone, and your JazzCash/Easypaisa number in `payment.transferNote`.
- `images/og-cover.jpg`: a real photo, 1200×630px.
- Replace `byar-general-store.netlify.app` with your real Netlify URL in `index.html`, `robots.txt`, `sitemap.xml`.

## 6. Test before going live
- Place a test order on your live URL, all the way through to the WhatsApp message.
- Check `/owner` shows the order and stock dropped.
- Check `/admin` lets you edit a product and it appears on the site after redeploy.

That's it — the site is live and free to run on Netlify's free tier at this scale.
