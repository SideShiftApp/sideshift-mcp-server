---
name: sideshift-setup
description: Use when the user needs to install, authorize, troubleshoot, or verify the SideShift MCP connection in ChatGPT, Codex, Claude, Cursor, or another MCP-compatible host.
---

# SideShift setup

SideShift uses one hosted Streamable HTTP MCP server and browser-based OAuth. The canonical
endpoint is `https://app.sideshift.app/api/mcp`.

## Connect

1. Confirm the SideShift plugin or MCP connection is enabled in the current host.
2. Start the host's connection or authorization flow; do not ask the user to create an API key.
3. Complete SideShift sign-in in the browser, select the intended company, review the requested
   scopes, and approve only if the company and permissions are correct.
4. Call `whoami` after authorization and report the connected company and granted scopes.
5. If the company matches the user’s stated target, continue the authorized work. Ask which company
   they intend only when it is missing, ambiguous, or different from the connected company.

## Troubleshoot

- A `401` means the credential is missing, expired, or revoked. Restart the host's OAuth flow.
- A `403 insufficient_scope` can mean either a missing consented scope or narrower current team
  permissions. Check the target and effective scopes from `whoami`. A company owner or authorized
  team manager must update team permissions before reauthorization can grant missing access.
- A `402` means the company needs billing attention. Present the server's billing handoff link.
- A `404` means absent or invisible to this company. Check the intended tenant; never probe IDs.
- Never request access tokens, refresh tokens, cookies, or client secrets in chat.
- If `whoami` is unavailable, confirm that the SideShift MCP is enabled and reload the host's
  plugins/connections before trying again.
- Keep credentials, private creator data, company data, and raw OAuth responses out of logs,
  screenshots, commits, and public issue reports.

## Agencies and subaccounts

Consent binds the connection to one company. An agency may allow no subaccounts, selected
subaccounts, or all current and future subaccounts. Read `whoami.subaccountAccess`, resolve names
through `list_companies`, and pass `act_as_subaccount_id` on every call targeting a child. This
argument applies to one call; it does not switch the session. Access also depends on the user's
current membership and permissions in that child. Reconnect to change the bound company or
consent to additional delegation; refreshing a token does not switch companies.
