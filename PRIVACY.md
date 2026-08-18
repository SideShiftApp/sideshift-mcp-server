# Privacy and data handling

Last updated: August 18, 2026

This repository contains the open-source SideShift plugin package for Cursor. It contains configuration and agent guidance; it does not contain a local MCP runtime, analytics SDK, advertising SDK, tracking pixel, or telemetry script.

## Data flow

When the SideShift MCP server is enabled, Cursor sends MCP protocol requests directly to `https://app.sideshift.app/api/mcp`. SideShift authenticates the user through a browser-based OAuth 2.1 flow and binds the resulting authorization to the company and scopes the user approves.

The plugin repository does not receive or store credentials or SideShift company data. Cursor and SideShift may process data needed to provide their respective services under their own terms and privacy policies.

## Access controls

- No secret is committed in `mcp.json` or requested by the bundled skill.
- The MCP server enforces the authenticated user's company and granted OAuth scopes.
- Users can disable or uninstall the plugin in Cursor and revoke the SideShift authorization from their SideShift account.
- The plugin's instructions require confirmation before consequential writes and state verification before retrying uncertain outcomes.

## Policies and questions

- [SideShift Privacy Policy](https://sideshift.app/privacy-policy)
- [SideShift Terms of Service](https://sideshift.app/terms-of-service)
- [Cursor Privacy Policy](https://cursor.com/privacy)
- [SideShift Contact](https://sideshift.app/contact)

For plugin questions, open a GitHub issue without including credentials, personal data, or company data. Report security concerns privately as described in [SECURITY.md](.github/SECURITY.md).
