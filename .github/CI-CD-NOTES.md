# CI/CD with GitHub Actions — teaching notes

Companion to [`.github/workflows/backend-ci-cd.yml`](workflows/backend-ci-cd.yml).

## 1. The vocabulary

| Term | What it is | In our file |
|---|---|---|
| **Workflow** | One automated process = one YAML file in `.github/workflows/` | `Backend CI/CD` |
| **Event / trigger** | What makes it run (`on:`) | push & PR to `main`/`master`, manual button |
| **Job** | A named group of steps that runs on **one fresh VM** | `lint`, `deploy` |
| **Runner** | The VM GitHub gives the job (`runs-on:`) | `ubuntu-latest` |
| **Step** | One command or one reusable action | "Install dependencies" |
| **Action** | Someone else's reusable step, pulled in with `uses:` | `actions/checkout@v4` |
| **Secret** | Encrypted value, injected at run time | `secrets.EC2_SSH_KEY` |

Key mental model: **jobs are isolated and parallel by default.** Each one starts on a
brand-new empty machine — that's why every job repeats `checkout` and `npm ci`. Nothing
survives from one job to the next unless you explicitly pass it (artifacts/cache).

`needs:` is what turns parallel jobs into a pipeline:

```
lint ──────────▶ deploy
(fast, no code run)   (only on push to main/master)
```

## 2. CI vs CD

- **CI (Continuous Integration)** — the `lint` job. Every push gets automatically
  checked. The point is to catch breakage in minutes, not after it's on the server.
- **CD (Continuous Deployment)** — `deploy`. When CI is green on `main`/`master`,
  the new code goes live with no human SSH-ing anywhere.

Lint runs first and deploy `needs: lint`, so nothing that fails static checks can
reach the server. Fail cheap, fail early.

Real proof this works: when we added ESLint to this repo it immediately found three
live bugs — an undefined `message` variable, a misspelled `Errorhandler` that would
have crashed `updateAppointmentStatus`, and `"CasteError"` instead of `"CastError"`.

## 3. The tests (local for now — a ready-made 3rd job)

The workflow currently has two jobs. There is also a working test suite in
`Backend/test/`, run with `npm test`, that is **not** wired into CI yet — adding it
is the natural next lesson (see the end of this file).

It uses Node's built-in runner (`node --test`) plus **supertest**, which calls the
Express app in-process — no server to start, no port to bind.

The tests never touch MongoDB. `app.js` has:

```js
if (process.env.NODE_ENV !== "test") {
    dbConnection();
}
```

and every tested route returns from a validation or auth branch *before* any DB call.
That's deliberate: **CI must not depend on secrets or external services.** The moment
tests need a real database, they become slow and flaky.

Run them locally:

```bash
cd Backend
npm run lint
npm test
```

## 4. One-time server setup (you do this by hand, once)

The workflow needs two things to already exist on the EC2 box. They are one-time
only because a deploy shouldn't be in the business of creating servers.

```bash
ssh -i your-key.pem ubuntu@<EC2_IP>

# 1. clone the repo
cd ~
git clone https://github.com/shikhabhadoria/HOSPITAL_MANAGEMENT_SYSTEM.git
cd HOSPITAL_MANAGEMENT_SYSTEM/Backend

# 2. create the env file (gitignored, so it never travels through GitHub)
cp config/config.env.example config/config.env
nano config/config.env          # fill in PORT, MONGO_URI, JWT_SECRET_KEY, ...
chmod 600 config/config.env
```

That's it. **Do not `npm install` and do not `pm2 start` yourself** — the workflow's
first run does both. It detects that pm2 has no process yet and runs `pm2 start`
instead of `pm2 restart`, so the first automated deploy and the hundredth take the
same path through the same YAML.

Optional, so pm2 comes back after an EC2 reboot:

```bash
pm2 startup        # prints a sudo command - run the command it prints
```

Also open your `PORT` (e.g. 4000) in the EC2 **Security Group → Inbound rules**.
CI doesn't need it (the health check runs on `localhost` inside the box) but your
frontend does.

## 5. Secrets you must add before the deploy job works

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Example | What it is |
|---|---|---|
| `EC2_HOST` | `13.234.56.78` | EC2 public IP or DNS |
| `EC2_USER` | `ubuntu` | SSH login user |
| `EC2_SSH_KEY` | `-----BEGIN ... KEY-----` | Full contents of your `.pem` file, including both header lines |
| `EC2_APP_DIR` | `/home/ubuntu/HOSPITAL_MANAGEMENT_SYSTEM` | Where you cloned the repo |
| `PM2_APP_NAME` | `hms-backend` | Name that will show up in `pm2 list` |

No repo-URL secret is needed — the server already has the clone. No port secret
either — the health check reads `PORT` straight out of `config/config.env`.

Teaching aside: only `EC2_SSH_KEY` is truly secret. The rest are non-sensitive and
could be repo **Variables** (`vars.X`) instead. Secrets are masked in logs; variables
are not.

## 6. What the deploy job does on the box

```
[ -d .git ] || fail                     # you cloned it once, by hand
[ -f config/config.env ] || fail        # you created it once, by hand
git fetch --all
git reset --hard origin/<branch>        # make the server match GitHub exactly
npm ci --omit=dev                       # exact prod deps
pm2 restart <name> --update-env         # or `pm2 start` on the very first run
pm2 save                                # survive a reboot
```

Then a **smoke test**: `curl http://localhost:$PORT/health` up to 10 times, run
*inside* the box over SSH. A deploy is not "done" because the SSH commands exited 0
— it's done when the server answers. `/health` was added to `app.js` for exactly
this. On failure it dumps the last 40 pm2 log lines into the Actions output, so you
debug from the browser instead of SSH-ing in.

`config/config.env` is gitignored, so it stays on the EC2 box untouched by
`git reset --hard`. Your secrets never travel through GitHub.

## 7. Things to demo live

1. Push a broken line (`const x = ;`) → **lint** goes red and **deploy** never starts.
2. Push an unused variable → lint fails on a *style* problem, not a crash. Good moment
   to explain why teams gate on this at all.
3. Open a PR → lint runs, deploy is skipped (point at the `if:` guard).
4. Merge to `master` → both jobs run; `pm2 list` on EC2 shows a bumped restart count.
5. Break the health check on purpose (`pm2 stop hms-backend` right after a deploy
   starts) → the smoke-test step goes red and prints the pm2 logs in the browser.

### Adding a 3rd job as the next lesson

`Backend/test/` already has 7 passing tests. Turning them into a `test` job is a
copy-paste of the `lint` job with `run: npm test` and `NODE_ENV: test`, then changing
deploy to `needs: [lint, test]`. Doing it live is a clean way to show that jobs are
just blocks you compose, and that `needs:` is the only thing creating order.
