# Cursor Marketplace publisher application

Official form: [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)

This is the original SideShift Marketplace application. It uses the same public GitHub repository,
same repository-owned logo, and same hosted MCP endpoint used by the OpenAI and Claude packages.
Do not submit or accept the Publisher Terms until a SideShift owner has reviewed the values below.

## Copy-ready fields

| Form field | Value |
| --- | --- |
| Organization name | `SideShift` |
| Organization handle | `sideshift` (confirm availability in the form) |
| Unique namespace | `@sideshift` (confirm availability in the form) |
| Contact email | `neev@sideshift.app` |
| Logotype URL | `https://raw.githubusercontent.com/SideShiftApp/sideshift-mcp-server/v1.1.0/assets/logo.png` |
| Description | `SideShift is an end-to-end UGC and influencer marketing platform for brands and agencies. This plugin connects Cursor to your authorized SideShift workspace so you can discover and recruit creators, plan and manage campaigns, work with applications and offers, review content, coordinate contracts and deliverables, analyze creator and campaign performance, inspect financial records, and use the complete SideShift capability catalog through secure OAuth.` |
| GitHub repository | `https://github.com/SideShiftApp/sideshift-mcp-server` |
| Owner | `Dev Testing Don` |
| Website URL | `https://sideshift.app` |
| Support | `https://sideshift.app/contact` |
| Privacy policy | `https://sideshift.app/privacy-policy` |
| Terms of service | `https://sideshift.app/terms-of-service` |

The logo URL above is intentionally tied to the public `v1.1.0` release rather than Firebase
Storage. If the release tag changes before submission, update it to the final immutable tag.

## Before submission

1. Confirm the repository is public and the release version is on the default branch.
2. Confirm the live endpoint is `https://app.sideshift.app/api/mcp` and the public package points to
   that endpoint without an API key or alternate auth path.
3. Confirm the organization handle and namespace are not already claimed.
4. Confirm the owner value and contact email are authorized by SideShift.
5. Review the Publisher Terms and submit only after the authorized owner accepts them.

Cursor's form submission is a publisher action and is intentionally not automated by this
repository. Use the same private reviewer account and Dev Testing Don verification described in
[`reviewer-test-plan.md`](reviewer-test-plan.md).
