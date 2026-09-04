#!/usr/bin/env node

import process from "node:process";
import { readFile } from "node:fs/promises";

const { version } = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

const endpoint = "https://app.sideshift.app/api/mcp";
const protectedResourceUrl = "https://app.sideshift.app/.well-known/oauth-protected-resource/api/mcp";
const authorizationServerUrl = "https://app.sideshift.app/.well-known/oauth-authorization-server";
const headers = { "User-Agent": `sideshift-mcp-plugin-smoke/${version}` };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(response, label) {
  const contentType = response.headers.get("content-type") ?? "";
  assert(contentType.includes("application/json"), `${label} returned unexpected content type: ${contentType}`);
  return response.json();
}

async function main() {
  for (const protocolVersion of ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"]) {
  const challengeResponse = await fetch(endpoint, {
    signal: AbortSignal.timeout(15_000),
    method: "POST",
    headers: {
      ...headers,
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion,
        capabilities: {},
        clientInfo: { name: "sideshift-mcp-plugin-smoke", version },
      },
    }),
    redirect: "error",
  });

  assert(challengeResponse.status === 401, `MCP endpoint must challenge unauthenticated clients with 401; got ${challengeResponse.status}`);
  const challenge = challengeResponse.headers.get("www-authenticate") ?? "";
  assert(challenge.startsWith("Bearer "), "MCP endpoint did not return a Bearer challenge");
  assert(challenge.includes(`resource_metadata=\"${protectedResourceUrl}\"`), "Bearer challenge has the wrong protected-resource metadata URL");
  const challengeBody = await readJson(challengeResponse, "MCP challenge");
  assert(challengeBody?.jsonrpc === "2.0", "MCP challenge is not a JSON-RPC response");
  assert(challengeBody?.error?.code === -32001, `MCP challenge returned unexpected error code: ${challengeBody?.error?.code}`);

  }

  const resourceResponse = await fetch(protectedResourceUrl, { headers, redirect: "error", signal: AbortSignal.timeout(15_000) });
  assert(resourceResponse.ok, `Protected-resource metadata returned ${resourceResponse.status}`);
  const resource = await readJson(resourceResponse, "Protected-resource metadata");
  assert(resource.resource === endpoint, `Protected resource must be ${endpoint}`);
  assert(Array.isArray(resource.authorization_servers) && resource.authorization_servers.includes("https://app.sideshift.app"), "Protected resource is missing the SideShift authorization server");
  assert(Array.isArray(resource.bearer_methods_supported) && resource.bearer_methods_supported.includes("header"), "Protected resource must support bearer tokens in the Authorization header");
  assert(Array.isArray(resource.scopes_supported) && resource.scopes_supported.length > 0, "Protected resource did not advertise any scopes");

  assert(!resource.scopes_supported.some((scope) => ["*", "offline_access", "performance:read"].includes(scope)), "Protected-resource metadata must expose only public capabilities");

  const authorizationResponse = await fetch(authorizationServerUrl, { headers, redirect: "error", signal: AbortSignal.timeout(15_000) });
  assert(authorizationResponse.ok, `Authorization-server metadata returned ${authorizationResponse.status}`);
  const authorization = await readJson(authorizationResponse, "Authorization-server metadata");
  assert(authorization.issuer === "https://app.sideshift.app", "Authorization server has the wrong issuer");
  assert(authorization.authorization_endpoint === "https://app.sideshift.app/api/oauth/v1/authorize", "Authorization endpoint is incorrect");
  assert(authorization.token_endpoint === "https://app.sideshift.app/api/oauth/v1/token", "Token endpoint is incorrect");
  assert(authorization.registration_endpoint === "https://app.sideshift.app/api/oauth/v1/register", "Dynamic Client Registration endpoint is incorrect");
  assert(authorization.code_challenge_methods_supported?.includes("S256"), "Authorization server must advertise PKCE S256");
  assert(authorization.token_endpoint_auth_methods_supported?.includes("none"), "Authorization server must allow public OAuth clients");

  assert(authorization.grant_types_supported?.includes("refresh_token"), "Authorization server must support refresh tokens");
  assert(resource.scopes_supported.every((scope) => authorization.scopes_supported?.includes(scope)), "Resource scopes must be recognized by the authorization server");

  // Discovery checks do not establish authenticated host interoperability.
  console.log(`Live MCP discovery verified: 401 Bearer challenges for four protocol versions, protected resource, OAuth issuer, DCR, and PKCE S256 (${resource.scopes_supported.length} advertised scopes).`);
}

try {
  await main();
} catch (error) {
  console.error(`Live MCP smoke failed: ${error.message}`);
  process.exitCode = 1;
}
