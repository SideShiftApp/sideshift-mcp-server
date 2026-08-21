## Summary

- <!-- Describe the change. -->

## Verification

- [ ] `npm run check`
- [ ] `npm run smoke`
- [ ] Loaded from `~/.cursor/plugins/local/sideshift` when Cursor changes are affected
- [ ] Confirmed the changed manifest, logo, skills, commands, and MCP server in the relevant host
- [ ] Ran `claude plugin validate . --strict` when Claude package files changed
- [ ] Ran the bundled Codex plugin validator when `.codex-plugin` files changed
- [ ] Completed OAuth with **Dev Testing Don** and verified `whoami`
- [ ] Performed no consequential or customer-data mutation during release testing

## Marketplace impact

- Plugin version:
- Listing metadata changed: yes / no
- Re-index required after merge: yes / no
- One MCP endpoint preserved: yes / no
