# Claude plugin-directory submission

Official references:

- [Submit a plugin](https://claude.com/docs/plugins/submit)
- [Create plugins](https://code.claude.com/docs/en/plugins)
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference)

This is separate from the Claude remote Connector Directory submission. The repository is a public
Claude Code plugin that bundles the same remote SideShift MCP configuration with shared skills and
commands. Users can install it for Claude Code and compatible Claude plugin surfaces after review.

## Submission values

| Form field | Value |
| --- | --- |
| Plugin name | `SideShift` |
| Description | `Connect Claude to SideShift, the end-to-end UGC and influencer marketing platform, to discover and recruit creators, plan campaigns, review content, coordinate deliverables, analyze performance, and inspect the full authorized SideShift workspace through OAuth.` |
| Public GitHub repository | `https://github.com/SideShiftApp/sideshift-mcp-server` |
| Release | `v1.1.0` |
| Documentation | `https://docs.sideshift.app/mcp-server` |
| Support | `https://sideshift.app/contact` |
| Privacy | `https://sideshift.app/privacy-policy` |
| Terms of service | `https://sideshift.app/terms-of-service` |
| License | `Apache-2.0` |

## Repository structure to review

```text
.claude-plugin/plugin.json  # Claude manifest
.mcp.json                   # same remote SideShift MCP endpoint
skills/                     # SideShift operations and setup guidance
commands/                   # OAuth connection command
assets/logo.png             # repository-owned square logo
README.md                   # install and safety guidance
PRIVACY.md                  # package data-flow disclosure
```

Only `plugin.json` belongs inside `.claude-plugin/`; all other component directories remain at the
plugin root, as required by Claude Code.

## Required local validation

From the repository root, run:

```bash
claude plugin validate . --strict
claude --plugin-dir .
```

Inside the local session, verify that the namespaced connection command and SideShift skill load,
the `.mcp.json` server points to `https://app.sideshift.app/api/mcp`, and the authorization flow
opens without asking for a pasted API key. Test with the reviewer plan before submitting.

The repository's independent checks are:

```bash
npm run check
npm run smoke
```

Claude's public submission requires a public GitHub repository and the review pipeline runs plugin
validation and automated safety screening. After publication, repository updates are screened and
mirrored according to Anthropic's current catalog process; bump the manifest version for releases.

## Manual submission choices

Use either the Claude.ai Team/Enterprise directory form (with directory management access) or the
Anthropic Console plugin-submission form. Paste the values above, link the released public commit,
and include validation evidence. Do not submit from a dirty or unreleased local checkout.

This plugin submission does not replace the separate Connector Directory submission. If both are
approved, they should still reference the same SideShift MCP endpoint and release documentation.

## Financial-policy prerequisite

The full unchanged MCP catalog includes payout, Quick Pay, invoice-refund, and wallet-transfer
actions. Anthropic's current Software Directory Policy requires prior written permission for
software that transfers money or financial assets or executes financial transactions. Before
submitting this plugin, ask `mcp-review@anthropic.com` whether the connector exception can cover
both directory entries and obtain explicit written permission for this plugin listing. Do not
represent the plugin as non-financial, and do not submit it while that policy prerequisite remains
unresolved.
