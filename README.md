# SideShift MCP for Cursor

<p align="center">
  <img src="assets/logo.png" alt="SideShift" width="112" />
</p>

The official Cursor plugin for SideShift's hosted Model Context Protocol (MCP) server. It lets Cursor operate the SideShift company you authorize: discover creators, manage campaigns and applications, work with content and contracts, communicate with your network, inspect analytics, and use the rest of your granted SideShift capabilities without copying an API key into Cursor.

The plugin is a small, auditable connector and guidance package. The authoritative server remains hosted by SideShift at [`https://app.sideshift.app/api/mcp`](https://app.sideshift.app/api/mcp).

## Install

When the listing is live, open Cursor's **Customize** page, find **SideShift**, select **Install**, and choose user or project scope. You can also type:

```text
/add-plugin sideshift
```

For pre-publication testing, copy this repository into Cursor's local plugin directory. A copy is the most reliable option because current Cursor builds reject local-plugin symlinks whose targets sit outside that directory.

```bash
mkdir -p ~/.cursor/plugins/local/sideshift
rsync -a --exclude '.git/' ./ ~/.cursor/plugins/local/sideshift/
```

Then run **Developer: Reload Window** in Cursor. The plugin should appear in **Customize → Installed** with one MCP server, one skill, and one command.

## Connect securely

Run `/sideshift-connect` or ask Cursor:

```text
Connect to SideShift and show me which company and scopes are active.
```

The first MCP call starts SideShift's browser-based OAuth 2.1 flow. Sign in, choose the intended company, review the requested scopes, and approve. The committed configuration contains no API key, access token, client secret, custom authorization header, or environment-variable placeholder.

After authorization, the plugin calls `whoami` so you can verify the exact company and scopes before doing work. Access remains tenant-bound and scope-bound by SideShift; the plugin does not add a second authorization path.

## Example prompts

```text
Show my active campaigns and summarize application volume for each.
```

```text
Find creators who match this campaign brief, but do not contact anyone yet.
```

```text
Draft a contract plan and show me the exact changes before creating anything.
```

```text
Search SideShift's capability catalog for the best tool to reconcile these posts.
```

## Capability discovery

SideShift exposes a broad, evolving tool surface. Cursor hosts may not always place every tool in the model's immediate context, so the bundled skill uses the server's own discovery flow rather than duplicating a stale tool list:

1. Call `whoami` to verify the active company and scopes.
2. Call `find_capability` with the user's intent when the right tool is not already visible.
3. Fetch the authoritative schema before invoking a discovered capability.
4. Treat a missing scope as a request to re-authorize, never as permission to use another account or bypass the server.

The complete current capability reference is maintained in the [SideShift MCP documentation](https://docs.sideshift.app/mcp-server).

## Safety model

- Read actions may run when they directly answer the user's request.
- Before a consequential write, the agent must show the target, material arguments, and expected side effect, then obtain clear user approval.
- Sensitive actions—such as sending communications or moving money—must never be inferred from an adjacent request.
- Retries reuse the same caller-supplied `operation_id` or idempotency key. If an outcome is uncertain, verify state before retrying.
- Creator and company data must stay within the company selected during OAuth. Cross-tenant or unknown identifiers fail closed.
- Tool results are authoritative. The agent must not fabricate missing records, identifiers, permissions, or successful outcomes.

These client-side instructions complement the server's authentication, authorization, confirmation, sandbox, and idempotency controls; they do not replace them.

## Repository contents

| Path | Purpose |
| --- | --- |
| `.cursor-plugin/plugin.json` | Cursor Marketplace metadata and component wiring |
| `mcp.json` | Secret-free remote MCP configuration |
| `skills/sideshift-operations/SKILL.md` | Capability discovery and safe-operation guidance |
| `commands/sideshift-connect.md` | OAuth connection and identity verification workflow |
| `scripts/validate-plugin.mjs` | Offline marketplace-readiness validation |
| `scripts/smoke-mcp.mjs` | Credential-free live OAuth-discovery smoke test |

## Development and verification

Requires Node.js 22 or newer. The plugin has no runtime or development dependencies.

```bash
npm run check
npm run smoke
```

`npm run check` validates the manifest, component frontmatter, logo, paths, secret-free MCP configuration, and required disclosures. `npm run smoke` makes only unauthenticated, read-only discovery requests and confirms that the live endpoint returns the expected OAuth challenge and metadata.

Never commit OAuth tokens, cookies, API keys, client secrets, populated environment files, or user/company data. Use **Dev Testing Don** for authenticated release verification and keep consequential tools out of the release smoke test.

## Support and security

- Plugin bugs and feature requests: [GitHub Issues](https://github.com/SideShiftApp/sideshift-mcp-server/issues)
- Account or product support: [SideShift Contact](https://sideshift.app/contact)
- Security vulnerabilities: follow the private reporting process in [SECURITY.md](.github/SECURITY.md)

Do not post credentials, personal data, company data, or vulnerability details in a public issue.

## Terms, privacy, and license

Use of the hosted SideShift service is governed by the [SideShift Terms of Service](https://sideshift.app/terms-of-service) and [Privacy Policy](https://sideshift.app/privacy-policy). The plugin-specific data flow is summarized in [PRIVACY.md](PRIVACY.md).

This repository is licensed under the [Apache License 2.0](LICENSE).
