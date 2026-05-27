# Deploy the SaaS Scenario Builder to GitHub Pages

A step-by-step walkthrough to take the project from your computer to a live, shareable demo URL.

**End result:** anyone with the link will see a working version of the dashboard at:
`https://<your-username>.github.io/saas-scenario-builder/`

Estimated time: **10–15 minutes**.

---

## Before you start

You need:

- A GitHub account (you confirmed you have one).
- Git installed (you confirmed it is).
- The project folder at: `C:\Users\Owner\Documents\Claude\Projects\Brite Dashboard\saas-scenario-builder`

> **One cleanup step first:** there's a partial `.git` subfolder inside `saas-scenario-builder` left over from setup. Delete it before continuing. In **File Explorer**, turn on "Show hidden items" (View → Show → Hidden items), then right-click the `.git` folder inside `saas-scenario-builder` and choose **Delete**. Or run this in PowerShell:
>
> ```powershell
> Remove-Item -Recurse -Force "C:\Users\Owner\Documents\Claude\Projects\Brite Dashboard\saas-scenario-builder\.git"
> ```

---

## Step 1 — Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new) (sign in if needed).
2. Fill in the form:
   - **Repository name:** `saas-scenario-builder`
   - **Description:** *Interactive SaaS scenario builder — KPIs, unit economics, and ML overlay* (optional)
   - **Visibility:** **Public** (required for free GitHub Pages)
   - **Initialize this repository with:** leave **everything unchecked** (no README, no .gitignore, no license — we already have them locally)
3. Click **Create repository**.

You'll land on a page that says *"…or push an existing repository from the command line"*. Keep that tab open — you'll need the URL from it in Step 3.

---

## Step 2 — Initialize Git locally and commit your code

Open **PowerShell** (Start menu → type "PowerShell" → Enter) and run these commands one at a time:

```powershell
# 1. Navigate into the project folder
cd "C:\Users\Owner\Documents\Claude\Projects\Brite Dashboard\saas-scenario-builder"

# 2. Initialize a fresh git repo on the 'main' branch
git init -b main

# 3. (One-time, if you've never set these before) Tell git who you are
git config user.name "Jared"
git config user.email "jared.limon.ch@gmail.com"

# 4. Stage every file
git add .

# 5. Verify what's about to be committed (should list index.html, app.js, README.md, LICENSE, .gitignore)
git status

# 6. Create the first commit
git commit -m "Initial commit: SaaS Scenario Builder"
```

If any command errors out, stop and paste the error back to me — easier to fix one thing at a time.

---

## Step 3 — Connect your local repo to GitHub and push

Back on the GitHub page from Step 1, copy the HTTPS URL — it looks like:

```
https://github.com/<your-username>/saas-scenario-builder.git
```

Then in the same PowerShell window:

```powershell
# Replace <your-username> with your actual GitHub username
git remote add origin https://github.com/<your-username>/saas-scenario-builder.git

# Push your code to GitHub
git push -u origin main
```

The first time you push, a browser window may pop up to authorize via GitHub. Approve it. When it finishes, refresh the GitHub repo page — your files should now appear there.

---

## Step 4 — Turn on GitHub Pages (the live demo)

1. On your repo page, click **Settings** (top tab bar).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment**:
   - **Source:** *Deploy from a branch*
   - **Branch:** select `main`, folder `/ (root)`
4. Click **Save**.
5. Wait about 30–60 seconds, then refresh the page. You'll see a green banner:
   > **Your site is live at** `https://<your-username>.github.io/saas-scenario-builder/`

Click that link — your dashboard is now public.

---

## Step 5 — Polish the repo (optional but nice)

These small touches make the repo look much more professional when someone visits it:

1. On the repo's main page, click the **About** gear icon (right sidebar).
2. Fill in:
   - **Description:** *Interactive SaaS scenario builder — live KPIs, unit economics, ML overlay*
   - **Website:** paste your Pages URL from Step 4
   - **Topics:** add tags like `saas`, `analytics`, `dashboard`, `data-science`, `kpi`
3. Check **"Use your GitHub Pages website"** so the live link shows in the sidebar.
4. Click **Save changes**.

---

## Sharing it

When you want someone to see the demo, send them **two links**:

- **Live app:** `https://<your-username>.github.io/saas-scenario-builder/`
- **Source code:** `https://github.com/<your-username>/saas-scenario-builder`

For a job application or LinkedIn post, the live link is what matters — recruiters can click it and play with every slider in seconds.

---

## Making future changes

Once the repo is set up, updating it is a 3-command loop. Edit any file, then:

```powershell
cd "C:\Users\Owner\Documents\Claude\Projects\Brite Dashboard\saas-scenario-builder"
git add .
git commit -m "Describe what you changed"
git push
```

GitHub Pages will redeploy automatically in ~30 seconds.

---

## Troubleshooting

**"git is not recognized"** — Git isn't on your PATH. Open Git Bash from the Start menu instead and run the same commands from there.

**Push asks for a password and rejects it** — GitHub no longer accepts account passwords for git over HTTPS. Either let the browser auth pop-up handle it, or create a Personal Access Token at github.com/settings/tokens (classic, `repo` scope) and paste that as the password.

**Pages says "404"** — Pages takes 1–2 minutes the very first time. Refresh after a minute. If still 404, check Settings → Pages and confirm the branch is `main` and the folder is `/ (root)`.

**Charts don't load on the live site** — Make sure your browser isn't blocking the CDN (Chart.js / Google Fonts). Try a different browser or check the console (F12 → Console tab) for blocked requests.

---

That's it. The whole flow is: create empty repo on GitHub → `git init` + commit + push → flip on Pages → share the URL.
