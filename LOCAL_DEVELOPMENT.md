# ScholarLocal local development

ScholarLocal is a Next.js application backed by Figma-managed Payload CMS. The
downloaded source contains the application schema and UI, but it does not contain
the managed database, file storage, Payload secret, administrator SSO
configuration, or environment identity.

## Current platform limitation

`src/payload.config.ts` intentionally uses `buildFigmaConfig()`. Outside the
Figma Make runtime, that function stops when it cannot resolve `FIGMA_EID`.

Do not:

- invent a `FIGMA_EID`;
- use a Figma file key, node ID, site URL, or project name as `FIGMA_EID`;
- copy secrets into source control;
- run undocumented initialization commands;
- replace `buildFigmaConfig()` with Payload's `buildConfig()` without planning a
  complete migration to a separately hosted database, storage provider, and
  authentication system.

Figma's current Help Center documentation does not provide a supported local
initialization or credential-export workflow for downloaded Payload-backed Make
projects. It also notes that local codebase workflows are not currently
available for Payload-backed Make apps:

<https://help.figma.com/hc/en-us/articles/32640822050199-Add-a-backend-to-a-functional-prototype-or-web-app>

The complete application, including `/admin`, should continue to be developed
and tested in Figma Make unless Figma Support supplies an official local
provisioning workflow for this environment.

## Windows prerequisites

Use Node.js `24.22.1` and pnpm `10.34.3`, matching `.mise.toml`,
`package.json`, and the lockfile used by Make.

One PowerShell setup option is `fnm`:

```powershell
winget install Schniz.fnm
```

Open a new PowerShell window, then run:

```powershell
fnm env --use-on-cd | Out-String | Invoke-Expression
fnm install 24.22.1
fnm use 24.22.1
npm install --global pnpm@10.34.3
node --version
pnpm --version
```

Expected versions:

```text
v24.22.1
10.34.3
```

## Install and audit the checkout

From the project directory:

```powershell
pnpm install --frozen-lockfile
pnpm doctor
pnpm typecheck
pnpm format:check
```

`pnpm doctor` intentionally fails with a clear explanation when `FIGMA_EID` is
absent. That result identifies an external platform requirement, not a missing
npm package.

The generated `src/app/(payload)/admin/importMap.js` is managed by Payload and
is intentionally excluded from the formatting command.

## Dependency audit

Monaco's vulnerable transitive DOMPurify version is constrained to the patched
`3.4.17` release.

`pnpm audit --prod` currently reports 10 moderate advisories:

- seven advisories affect the app's pinned Next.js `16.4.2` and are patched in
  Next.js `16.4.5` or later;
- three transitive advisories are under `@payloadcms/figma` (`uuid`, `glob`, and
  `minimatch`).

Next.js `16.4.5` and `16.4.6` were both tested in the managed Make environment.
Both made `/` return HTTP 500 with
`routeModule.ensureInstrumentation is not a function`. Restoring the template's
Next.js `16.4.2` pin restored successful development bootstrap. The project
therefore retains the compatible version rather than claiming the security
upgrade is safe. Upgrade Next.js and `@payloadcms/figma` together when Figma
publishes a compatible patched integration; do not force incompatible
major-version overrides for the platform-owned dependencies.

## Starting the project

The cross-platform development command is:

```powershell
pnpm dev
```

The frontend and Payload Admin share one Next.js process:

- application: <http://localhost:3000>
- Payload Admin: <http://localhost:3000/admin>

For this downloaded managed-backend project, startup will still stop in
`buildFigmaConfig()` until Figma provides the environment identity and the other
managed backend credentials. `FIGMA_EID` by itself should not be assumed to be
sufficient.

## Environment-variable classification

These values are injected by Figma Make and should not be committed:

- `FIGMA_EID` and other managed backend identity/credential values;
- Payload database and storage configuration;
- Payload Admin SSO credentials;
- Figma Content API credentials.

These values are public runtime configuration in the existing app:

- `FIGMA_PUBLIC_URL` — Make preview/published origin;
- `NEXT_PUBLIC_SITE_URL` — local fallback is already
  `http://localhost:3000`.

No third-party API integration requiring a user-supplied key was found in the
current ScholarLocal source.

## If full local hosting becomes required

That is a backend migration rather than a missing-environment-variable fix. It
requires choosing and configuring:

1. a supported Payload database adapter and database;
2. persistent upload storage for public and protected research files;
3. a server-side Payload secret;
4. administrator authentication to replace Figma SSO;
5. a migration/export path for existing documents and files;
6. deployment and secret management outside Figma.

Do not begin that migration until the storage, authentication, and data-export
requirements are explicitly approved.
