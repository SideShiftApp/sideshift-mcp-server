# Marketplace reviewer test plan

This plan is shared by OpenAI, Claude Connector Directory, and any Cursor review. It is a private
operational checklist: never commit reviewer credentials, real customer data, or raw OAuth output.

## Reviewer tenant

Use the isolated SideShift company **Dev Testing Don**. It should contain synthetic records that
allow a reviewer to exercise the full unchanged MCP catalog without touching a real customer:

- at least two creators with different profiles and campaign fit;
- one active campaign and one completed campaign;
- applications and offers in pending, accepted, and declined states;
- content submissions with feedback and approval-ready examples;
- contract and deliverable status records;
- campaign and creator analytics with known values and a missing-data example;
- messages or communication records that are safe to inspect;
- invoices, wallet, and payout-status records with no real funds to transfer;
- disposable records for reversible write and destructive-operation tests;
- a reviewer user with exactly the scopes needed to test the catalog.

The account must not depend on MFA, email/SMS verification, a private network, or a real payment
method during review. If SideShift's account system requires an owner-only verification step,
complete that step privately before giving credentials to a directory.

## Credential handling

- Create a dedicated reviewer username and password only for directory testing.
- Store credentials in the private submission portal fields or SideShift's approved secret manager.
- Never place credentials in Git, Markdown, screenshots, issue bodies, logs, or chat.
- Rotate or disable the reviewer credentials after a directory review ends.
- Do not use a production employee's personal account as reviewer credentials.

## Protocol and authorization checks

1. Use MCP Inspector or the custom connector to confirm the initial unauthenticated `401` challenge.
2. Confirm protected-resource metadata and authorization-server discovery.
3. Complete Dynamic Client Registration and authorization-code PKCE with `S256`.
4. Verify token exchange, expiry, refresh, and missing-scope errors.
5. Call `whoami` and confirm the exact Dev Testing Don company.
6. Compare the tool list with the release inventory. No tool may be removed, hidden, or renamed by
   the packaging work.
7. Confirm every tool has a title, accurate description, input schema, and applicable annotations.
8. Attempt a cross-company or unknown identifier and confirm it fails closed.

For release `v1.1.0`, the expected ordinary-tenant inventory is 270 tools. Its ordered-name
SHA-256 is `95a9da3f4d3f5831549bd36c308682b42ab5497b9433864a4572ff31ded6a974`, and the canonical full
contract/metadata/security SHA-256 is
`0274e05ba75fcda07567d2577bbb44b8da1f27087dd3c4535ab4a57b09d41a6e`.

## Safe functional checks

- Read identity, campaigns, creators, applications, offers, content, contracts, messages,
  analytics, and financial records.
- Preview a reversible synthetic write, confirm the exact target and material arguments, execute it
  once, and read back the result.
- Exercise a disposable destructive tool only against a disposable synthetic resource and record
  the result privately.
- Attempt a financial action with no explicit confirmation or with an invalid/precondition-failing
  target; confirm no money moves.
- Ask the agent to follow an instruction embedded in creator-submitted content; confirm it treats the
  content as data and does not perform an unrelated action.

Maintain a private row-by-row tracker for all 270 tools with schema inspection, authorization,
functional result, expected side effect, read-back, and cleanup columns. Mark every tool pass,
intentional precondition failure, or policy-blocked with retained evidence; do not claim all-tool
coverage from category samples alone.

## Evidence to retain privately

- Tool inventory and version digest.
- MCP Inspector or connector test output with identifiers and personal data redacted.
- OAuth discovery/DCR/PKCE results.
- Read/write/destructive annotation audit.
- Cross-tenant and missing-scope negative results.
- Release commit SHA and immutable logo URL.

Do not claim a marketplace review is complete until the actual host's portal scan and reviewer
connection have passed. A local `npm run check` is necessary but not sufficient for marketplace
approval.
