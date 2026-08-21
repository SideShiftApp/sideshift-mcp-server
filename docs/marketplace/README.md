# Marketplace submission packet

This directory contains the copy-ready values and test plans for SideShift's submissions to:

- [Cursor Marketplace publisher application](https://cursor.com/marketplace/publish)
- [OpenAI universal Plugins Directory](https://developers.openai.com/plugins/deploy/submission)
- [Claude Connector Directory](https://claude.com/docs/connectors/building/submission)
- [Claude plugin community marketplace](https://claude.com/docs/plugins/submit)

All packages use one remote MCP endpoint and the complete live SideShift tool catalog:

`https://app.sideshift.app/api/mcp`

This repository does not remove, hide, rename, or split tools for any marketplace. Marketplace
scanners should inspect the same endpoint that existing SideShift integrations use. The files here
are preparation material; they do not submit a form, accept publisher terms, provide credentials,
or make legal/data-handling attestations on SideShift's behalf.

## Files

| File | Use |
| --- | --- |
| `openai-submission.md` | OpenAI listing fields, tests, challenge-token step, and handoff |
| `cursor-submission.md` | Cursor publisher application fields and manual handoff |
| `claude-connector-submission.md` | Claude remote Connector Directory fields and acknowledgements |
| `claude-plugin-submission.md` | Claude plugin-directory submission and validation |
| `reviewer-test-plan.md` | Shared reviewer-tenant setup, coverage, and credential handling |

## Release assets

After the repository release is tagged `v1.1.0`, use this immutable public logo URL in forms that
require a hosted image:

`https://raw.githubusercontent.com/SideShiftApp/sideshift-mcp-server/v1.1.0/assets/logo.png`

If the release tag changes, update the URL to the new immutable tag before submitting. Do not use
the former Firebase Storage URL.
