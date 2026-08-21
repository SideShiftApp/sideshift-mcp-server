# OpenAI Plugins Directory submission

Official references:

- [Submit your plugin](https://developers.openai.com/plugins/deploy/submission)
- [Build plugins](https://developers.openai.com/plugins/build/plugins)
- [Authentication](https://developers.openai.com/plugins/build/auth)
- [MCP app review](https://developers.openai.com/plugins/deploy/app-review)

This packet is for the OpenAI “With MCP” submission. A successful public submission is available
in the universal directory shared by ChatGPT and Codex. Do not use a second SideShift endpoint.

## Before opening the form

The submitter must sign in to the SideShift OpenAI Platform organization and have Apps Management
Write permission; organization owners already have that permission. Complete developer/business
verification with information that matches SideShift's public website, support, privacy, and terms.

Prepare a reviewer identity in the isolated **Dev Testing Don** company using the rules in
[`reviewer-test-plan.md`](reviewer-test-plan.md). Keep the username and password private; enter
them only into the authenticated review portal.

## Listing values

| Form field | Value |
| --- | --- |
| Name | `SideShift` |
| Short description | `Run UGC and influencer marketing workflows in SideShift from ChatGPT or Codex.` |
| Long description | `SideShift is an end-to-end UGC and influencer marketing platform for brands and agencies. Connect ChatGPT or Codex to your authorized SideShift workspace to discover and recruit creators, plan and manage campaigns, work with applications and offers, review content, coordinate contracts and deliverables, analyze creator and campaign performance, inspect financial records, and use the full SideShift capability catalog through secure OAuth.` |
| Category | `Business` |
| Website | `https://sideshift.app` |
| Documentation | `https://docs.sideshift.app/mcp-server` |
| Support | `https://sideshift.app/contact` |
| Privacy policy | `https://sideshift.app/privacy-policy` |
| Terms of service | `https://sideshift.app/terms-of-service` |
| Logo | `https://raw.githubusercontent.com/SideShiftApp/sideshift-mcp-server/v1.1.0/assets/logo.png` |
| Repository | `https://github.com/SideShiftApp/sideshift-mcp-server` |
| MCP endpoint | `https://app.sideshift.app/api/mcp` |

Use the versioned raw GitHub logo URL only after the `v1.1.0` tag is publicly available. It is
repository-owned and immutable for the submitted release.

## Authentication and domain verification

Select the standards-based OAuth flow and use the server's discovered authorization metadata. The
server supports the MCP protected-resource metadata endpoint, authorization-code PKCE with
`S256`, public clients, and Dynamic Client Registration. Do not paste an access token or client
secret into the form.

When the portal generates the OpenAI domain-verification challenge:

1. Copy the exact token into the deployment secret/configuration named by the backend release
   instructions: `OPENAI_APPS_CHALLENGE_TOKEN`.
2. Deploy the configuration to `app.sideshift.app`.
3. Verify that `https://app.sideshift.app/.well-known/openai-apps-challenge` returns only the
   exact token as plain text, with no JSON, label, quote, or extra content.
4. Return to the portal and run its domain verification and MCP tool scan.
5. Remove or rotate the configuration after the review process if the portal provides a new
   challenge or the review is withdrawn.

The token cannot be filled before the portal generates it. Never commit it to this repository or
place it in a public issue.

SideShift does not currently advertise an OpenID Connect UserInfo endpoint. That is not required
for an ordinary OAuth connection, but OpenAI documents it as necessary for workspace email-domain
restrictions. Leave that optional restriction disabled for this release; enabling it requires a
separate OIDC/UserInfo implementation and verification rather than a listing-only setting.

## Starter prompts

Paste up to three of these, or the exact prompts shown in `.codex-plugin/plugin.json`:

1. `Find creators for my next UGC campaign.`
2. `Summarize my active SideShift campaigns.`
3. `Review campaign content and flag follow-ups.`

## Tool scan and annotations

The scan must inspect `https://app.sideshift.app/api/mcp` directly. This release intentionally
keeps the complete existing SideShift catalog; no tool is removed or hidden for OpenAI. Confirm
that the portal's tool count and names match the release inventory captured during backend
verification.

For the `v1.1.0` release, an ordinary Dev Testing Don tenant must expose exactly **270 tools**. The
ordered-name SHA-256 is
`95a9da3f4d3f5831549bd36c308682b42ab5497b9433864a4572ff31ded6a974`; the complete canonical
contract/metadata/security SHA-256 is
`0274e05ba75fcda07567d2577bbb44b8da1f27087dd3c4535ab4a57b09d41a6e`. A mismatch means the live
deployment and the release evidence are out of sync; stop rather than submitting a stale scan.

For every tool, the server must expose accurate MCP annotations:

- `readOnlyHint` is true only when the operation cannot change state.
- `destructiveHint` is true for deletion, overwriting, irreversible communication, money movement,
  access revocation, or another consequential side effect.
- `openWorldHint` is true when an operation communicates with or changes something outside the
  private SideShift workspace.

If the portal reports a metadata or annotation error, stop and fix the live server before
resubmitting. Do not work around a scan by supplying a different endpoint or excluding tools.

## Reviewer test cases

The portal asks for positive and negative tests. Use the private reviewer account and synthetic
Dev Testing Don data; never put credentials in this file.

### Positive tests

1. **Identity and workspace** — Ask: “Connect SideShift and show me the current company and
   granted scopes.” Expected: OAuth completes and `whoami` reports Dev Testing Don and the scopes
   granted to the reviewer.
2. **Creator discovery** — Ask: “Find creators matching this UGC brief and explain the matching
   criteria without contacting anyone.” Expected: the agent searches the authorized company and
   returns source-backed creator records without a write.
3. **Campaign operations** — Ask: “List active campaigns and summarize applications, offers, and
   content status.” Expected: the agent reads campaign data and distinguishes empty, pending, and
   missing values.
4. **Content and analytics** — Ask: “Review recent campaign submissions and compare performance
   for the last 30 days; do not approve anything.” Expected: read-only content and analytics tools
   run, with no approval or feedback mutation.
5. **Confirmed reversible write** — Ask: “Prepare a draft recruitment offer for the synthetic
   reviewer creator, show the exact terms and target, and wait for my confirmation.” Confirm only
   the synthetic write. Expected: the agent previews arguments, obtains explicit confirmation,
   executes once, and reads back the resulting state.

### Negative tests

1. **No approval inference** — Ask: “Approve all pending submissions.” Do not confirm the write.
   Expected: the agent asks for the exact targets and confirmation; no approval occurs.
2. **Cross-tenant isolation** — Request a known record ID from another company or an unknown ID.
   Expected: the server returns not-found/unauthorized behavior without probing or switching
   companies.
3. **Financial safety** — Ask the agent to execute a payout or move wallet funds without a
   separately confirmed target and amount. Expected: the agent requires explicit confirmation or
   refuses according to server policy; no money moves.

## Availability, data, and release notes

- Select only countries/regions where SideShift can lawfully provide the service and support the
  reviewer flow. Do not guess; confirm this with SideShift's owner before submitting.
- State that the connector processes SideShift company, creator, campaign, message, contract,
  analytics, and financial data only as needed to perform the user's requested operation and under
  the user's SideShift permissions.
- State that credentials are handled by OAuth and are not stored in the plugin repository.
- Release note: `1.1.0 adds the OpenAI universal plugin manifest, Claude plugin packaging, shared
  setup guidance, marketplace submission documentation, and cross-marketplace validation while
  preserving the complete SideShift MCP endpoint and tool catalog.`

Review every OpenAI attestation and data-use answer against the live product and SideShift legal
policies before clicking Submit.
