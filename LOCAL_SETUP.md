# Running the demo on your own computer

These steps run the InnMetric guided demo on Windows, macOS or Linux, outside Replit. Everything in the demo is synthetic. The database you create here is a local development database only.

In Replit nothing below is needed: the configured workflows start both services.

## What you need

| Tool | Version | Check with |
| --- | --- | --- |
| Git | any recent | `git --version` |
| Node.js | 24 recommended. 22 and 26 have also run the demo. | `node -v` |
| pnpm | 10.28.0, the version the lockfile was made with | `pnpm -v` |
| PostgreSQL | 16 or 17 | `psql --version` |

Install pnpm with npm, never use npm or Yarn for the project itself:

```bash
npm install -g pnpm@10.28.0
```

## Windows only: two one-time settings

Run these in PowerShell.

1. Allow PowerShell to run the local `npm` and `pnpm` scripts for your user account:

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

2. Let pnpm run the project's shell scripts with Git Bash, which comes with Git for Windows:

   ```powershell
   pnpm config set script-shell "C:\Program Files\Git\bin\bash.exe"
   ```

If `node` is not recognised after installing Node.js, add it to your PATH and open a new window:

```powershell
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";C:\Program Files\nodejs", "User")
```

## 1. Get the code

```bash
git clone https://github.com/arifthei/innmetric-replit.git
cd innmetric-replit
```

If you need a branch that is not merged yet, fetch it and switch to it, for example:

```bash
git fetch origin
git checkout claude/sweet-ritchie-nrtf3p
```

## 2. Install dependencies

The workspace leaves out the native build tool binaries for every platform except Linux x64, because Replit only runs on Linux x64. On any other computer, run this first. It removes the exclusions for your platform only:

```bash
node scripts/prepare-local-install.mjs
```

Then install:

```bash
pnpm install --no-frozen-lockfile
```

On Linux x64 the script changes nothing and you can use `pnpm install --frozen-lockfile` instead.

**Do not commit `pnpm-workspace.yaml` or `pnpm-lock.yaml` after this step.** They are changed for your machine only. Before pulling new commits, put them back, then pull and repeat this step:

```bash
git checkout -- pnpm-workspace.yaml pnpm-lock.yaml
git pull
```

## 3. Start PostgreSQL and create the database

### Windows

```powershell
winget install PostgreSQL.PostgreSQL.17 --override "--mode unattended --superpassword postgres --serverport 5432"
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"
```

If the installer reports a failure and `Get-Service *postgres*` shows nothing, the programs are installed but no server was created. Create and start one yourself:

```powershell
initdb -D "$env:USERPROFILE\innmetric-pgdata" -U postgres -A trust -E UTF8 --locale=C
pg_ctl -D "$env:USERPROFILE\innmetric-pgdata" -l "$env:USERPROFILE\innmetric-pgdata\server.log" start
```

`-A trust` lets local connections in without a password. The server only accepts connections from your own computer. `--locale=C` avoids a known initdb problem with some non-English Windows locales.

Create the database:

```powershell
createdb -U postgres -h localhost innmetric_dev
$env:DATABASE_URL = "postgres://postgres@localhost:5432/innmetric_dev"
```

If your server uses a password, put it in the address: `postgres://postgres:PASSWORD@localhost:5432/innmetric_dev`.

### macOS (Homebrew)

```bash
brew install postgresql@17
brew services start postgresql@17
createdb innmetric_dev
export DATABASE_URL="postgres://$USER@localhost:5432/innmetric_dev"
```

### Linux (Debian or Ubuntu)

```bash
sudo apt install postgresql
sudo -u postgres createuser --superuser "$USER"
createdb innmetric_dev
export DATABASE_URL="postgres:///innmetric_dev"
```

### All platforms: create the tables

```bash
pnpm --filter @workspace/db run push
```

On an empty database this applies the schema without questions. If it ever asks to delete or rename something, answer no and check with the team first.

## 4. Start the API

Keep this terminal open. `DATABASE_URL` must be set in it.

Windows PowerShell:

```powershell
$env:PORT = "8080"
pnpm --filter @workspace/api-server run dev
```

macOS and Linux:

```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

Wait for `Server listening` with port 8080.

## 5. Start the web app

Open a second terminal in the project folder.

Windows PowerShell:

```powershell
$env:PORT = "23425"; $env:BASE_PATH = "/innmetric-pitch/"
pnpm --filter @workspace/innmetric-pitch exec vite --config vite.config.ts
```

macOS and Linux:

```bash
PORT=23425 BASE_PATH=/innmetric-pitch/ pnpm --filter @workspace/innmetric-pitch exec vite --config vite.config.ts
```

Use `exec vite` as shown, not `run dev`. On Windows, `run dev` goes through Git Bash, which rewrites `/innmetric-pitch/` into a Windows path and the app opens at the wrong address. The `run dev` script also adds `--host 0.0.0.0`, which makes the app reachable from other devices on your network.

Open <http://localhost:23425/innmetric-pitch/>. Outside Replit the web server forwards `/api` to the API on port 8080. Set `API_PORT` if your API runs on another port.

You should see the banner "Demonstration data. Not a live service or government programme." and the Guided walkthrough panel. `DEMO.md` has the presenter script.

## Starting again later

1. Start PostgreSQL if it is not running. On Windows with the manual setup:

   ```powershell
   pg_ctl -D "$env:USERPROFILE\innmetric-pgdata" -l "$env:USERPROFILE\innmetric-pgdata\server.log" start
   ```

2. Set `DATABASE_URL` and start the API (step 4).
3. Start the web app (step 5).

## Who can reach it

- The web app started as in step 5 only listens on your own computer.
- PostgreSQL only accepts connections from your own computer by default.
- The API listens on all network interfaces. If your firewall allows it, other devices on the same network can reach port 8080. It only serves synthetic demo data. Nothing is reachable from the internet unless you forward ports on your router.

## Optional: run the checks

```bash
pnpm --filter @workspace/api-server run test
```

The integration and browser tests need both services running. See `DEMO.md` for the commands.

## Troubleshooting

| Message | Cause and fix |
| --- | --- |
| `node` or `psql` is not recognized | The program is installed but not on PATH. Add its folder to PATH and open a new terminal. |
| `running scripts is disabled on this system` | Run the `Set-ExecutionPolicy` command above. |
| `'sh' is not recognized` during install | Set the pnpm `script-shell` to Git Bash (Windows settings above). |
| `Cannot find module @esbuild/...` or `@rollup/rollup-...` | Run `node scripts/prepare-local-install.mjs`, then `pnpm install --no-frozen-lockfile`. |
| `No schema files found` during `db push` | Pull the latest commits. Older versions of `lib/db/drizzle.config.ts` did not work on Windows. |
| `Connection refused` on port 5432 | PostgreSQL is not running. Start it (see "Starting again later"). |
| The app opens at `/Program%20Files/Git/innmetric-pitch/` | You used `run dev` on Windows. Use the `exec vite` command from step 5. |
| `The server is configured with a public base URL of ...` | Same cause as above. |
