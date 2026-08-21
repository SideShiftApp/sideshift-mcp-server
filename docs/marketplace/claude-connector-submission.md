# Claude Connector Directory submission

Official references:

- [Connector submission requirements](https://claude.com/docs/connectors/building/submission)
- [Connector authentication](https://claude.com/docs/connectors/building/authentication)
- [Connector testing](https://claude.com/docs/connectors/building/testing)
- [Connector review criteria](https://claude.com/docs/connectors/building/review-criteria)

This packet is for the remote MCP Connector Directory. It uses the same complete SideShift MCP
endpoint that Cursor and OpenAI use; it is not a reduced connector implementation.

## Access and reviewer preparation

The Claude.ai submission portal requires a Team or Enterprise organization and Directory management
access. Organization Owners have this access by default; a delegated Directory Manager can also
submit. Use the Anthropic Console route if the submitting author is not in a Team/Enterprise
organization and the Console account has the required role.

Prepare a private reviewer identity in **Dev Testing Don** according to
[`reviewer-test-plan.md`](reviewer-test-plan.md). Give Anthropic the credentials only in the
authenticated review form. Never commit them or include them in a public repository.

## Listing values

| Form field | Value |
| --- | --- |
| Server name | `SideShift` |
| Permanent slug | `sideshift` |
| Tagline (55 characters or fewer) | `UGC and influencer campaigns in SideShift` |
| Description (2,000 characters or fewer) | `SideShift is an end-to-end UGC and influencer marketing platform for brands and agencies. Connect Claude to your authorized SideShift workspace to discover and recruit creators, plan and manage campaigns, work with applications and offers, review content, coordinate contracts and deliverables, analyze creator and campaign performance, inspect financial records, and use the complete SideShift capability catalog through secure OAuth. The connector operates only within the company and scopes selected during authorization; it does not request or store an API key.` |
| MCP server URL | `https://app.sideshift.app/api/mcp` |
| Documentation | `https://docs.sideshift.app/mcp-server` |
| Privacy | `https://sideshift.app/privacy-policy` |
| Terms of service | `https://sideshift.app/terms-of-service` |
| Support | `https://sideshift.app/contact` |
| Icon | `https://raw.githubusercontent.com/SideShiftApp/sideshift-mcp-server/v1.1.0/assets/logo.png` |
| Repository | `https://github.com/SideShiftApp/sideshift-mcp-server` |

Select one to five categories that accurately describe SideShift, such as **Marketing**,
**Business**, **Social Media**, or the closest current marketplace equivalents. Confirm the final
category names in the live form because directory labels can change.

## Authentication

Choose OAuth 2.0 with Dynamic Client Registration. SideShift's authorization server advertises
the MCP protected-resource metadata, authorization endpoint, token endpoint, registration endpoint,
PKCE `S256`, and public-client support. Claude should register its redirect URI through the normal
OAuth flow; do not hard-code an Anthropic callback or create a client-specific server branch.

Review the requested scopes and authorize only the SideShift company intended for testing. The
server enforces tenant and scope boundaries for every tool call.

## Use cases and prerequisites

### Primary use cases

- Discover, compare, and shortlist creators for a UGC or influencer campaign.
- Plan campaigns and inspect applications, offers, content, contracts, and deliverables.
- Review creator-submitted content and identify follow-ups without approving or publishing it.
- Analyze creator and campaign performance while distinguishing missing or pending data.
- Inspect invoices, wallet, and payout status within the authorized company.

### Prerequisites

- A SideShift account with access to at least one company.
- Permission to authorize the SideShift MCP connection and requested scopes.
- A supported Claude account and, for the Claude.ai submission portal, a Team or Enterprise
  organization with Directory management access.
- A populated Dev Testing Don reviewer company for directory verification.

### Read and write behavior

The connector exposes the complete SideShift MCP tool catalog. Read-only tools inspect the selected
company. Write and sensitive tools can change SideShift state, communicate externally, or affect
financial records and therefore require the user's explicit approval and the server's own
authorization/confirmation controls. This submission does not hide, remove, or rename any tools.

## Testing evidence

Run the complete test plan in [`reviewer-test-plan.md`](reviewer-test-plan.md) with MCP Inspector or
the custom Claude connector before submitting. Confirm:

- Every tool has a human-readable `title`.
- Every tool has accurate `readOnlyHint` and/or `destructiveHint` metadata where applicable.
- Tool names are within the directory's 64-character limit.
- OAuth discovery, DCR, PKCE, token exchange, and refresh work.
- Reviewer credentials return realistic synthetic records.
- Cross-tenant and missing-scope access fails closed.
- No credential, private customer data, or secret appears in tool output or logs.

## Data handling answers

Answer the portal based on the live SideShift service and current SideShift legal policies. The
plugin package itself stores no credentials, company data, analytics, or tracking identifiers. The
remote server processes the data necessary to carry out the user's requested SideShift operation,
subject to the user's company membership, OAuth scopes, and SideShift privacy policy.

## Financial-transaction policy acknowledgement

Anthropic's current Software Directory Policy does not allow software that transfers money or
financial assets, or executes financial transactions, without Anthropic's prior written permission.
Because SideShift's unchanged full catalog includes payout, Quick Pay, invoice-refund, and wallet-
transfer actions, SideShift must request and receive that written permission before submitting this
connector. Email `mcp-review@anthropic.com`, describe the exact financial tools and server-side
authorization/confirmation controls, and retain the written approval with the submission evidence.
Do not attest that the connector is non-financial.

This packaging work deliberately does not remove, hide, or weaken any financial tools. Until the
written exception is granted, the package is technically ready but the Claude directory submission
is policy-blocked. The submission and exception request are manual publisher actions.

## Required acknowledgements

Before clicking Submit, the SideShift owner must review and accept the current portal's
acknowledgements, including directory guidelines, first-party API status, financial-transaction
policy, AI-generated media, prompt-injection/data safety, conversation-data handling, and public
documentation accuracy. The owner must also verify that all URLs, categories, data-handling answers,
reviewer credentials, and availability claims are true for the live service.
