# Contributing

Thanks for helping improve the SideShift MCP plugin package.

## Before opening a change

1. Search existing issues and pull requests.
2. Keep the hosted endpoint and OAuth flow authoritative; do not add an API-key fallback or a second authentication path.
3. Keep the plugin package secret-free and dependency-light.
4. Run `npm run check` and `npm run smoke` with Node.js 22 or newer.
5. Test the package in each available host. For Cursor, copy it into
   `~/.cursor/plugins/local/sideshift` and reload Cursor. For Claude Code, use
   `claude --plugin-dir .`. Document which hosts and flows you verified.

Do not use production customer data in tests or examples. Authenticated release verification uses the designated **Dev Testing Don** company and excludes consequential operations.

## Reporting problems

Use GitHub Issues for reproducible plugin bugs and feature requests. Do not include tokens, cookies, private company data, personal data, or exploit details. Report vulnerabilities privately according to [SECURITY.md](.github/SECURITY.md).
