#!/usr/bin/env node

import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedEndpoint = "https://app.sideshift.app/api/mcp";
const expectedRepository = "https://github.com/SideShiftApp/sideshift-mcp-server";
const expectedHomepage = "https://docs.sideshift.app/mcp-server";
const expectedVersion = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8")).version;
const errors = [];

function fail(message) {
  errors.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function readText(relativePath) {
  try {
    return await fs.readFile(path.join(root, relativePath), "utf8");
  } catch (error) {
    fail(`${relativePath} is missing or unreadable: ${error.message}`);
    return "";
  }
}

async function readJson(relativePath) {
  const text = await readText(relativePath);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`${relativePath} is invalid JSON: ${error.message}`);
    return null;
  }
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || path.isAbsolute(value)) return false;
  const normalized = path.posix.normalize(value.replaceAll("\\", "/"));
  return normalized !== ".." && !normalized.startsWith("../") && !normalized.includes("//");
}

function normalizeContractPath(value) {
  if (typeof value !== "string" || path.isAbsolute(value)) return "";
  return path.posix.normalize(value.replaceAll("\\", "/")).replace(/\/$/, "");
}

function parseFrontmatter(text, relativePath) {
  const normalized = text.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    fail(`${relativePath} is missing YAML frontmatter`);
    return {};
  }
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    fail(`${relativePath} has unterminated YAML frontmatter`);
    return {};
  }
  const fields = {};
  for (const line of normalized.slice(4, end).split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return fields;
}

async function validateComponent(relativePath, expectedName) {
  const fields = parseFrontmatter(await readText(relativePath), relativePath);
  assert(fields.name === expectedName, `${relativePath} must declare name: ${expectedName}`);
  assert(
    typeof fields.description === "string" && fields.description.length >= 40,
    `${relativePath} must have a specific description of at least 40 characters`,
  );
}

async function validateLogo(relativePath) {
  let logo;
  try {
    logo = await fs.readFile(path.join(root, relativePath));
  } catch (error) {
    fail(`${relativePath} is missing or unreadable: ${error.message}`);
    return { width: 0, height: 0 };
  }

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert(logo.subarray(0, 8).equals(pngSignature), `${relativePath} must be a PNG`);
  assert(logo.length >= 24, `${relativePath} is too small to contain a PNG IHDR chunk`);
  if (logo.length < 24) return { width: 0, height: 0 };

  const width = logo.readUInt32BE(16);
  const height = logo.readUInt32BE(20);
  assert(width === height, `${relativePath} must be square; found ${width}x${height}`);
  assert(width >= 512, `${relativePath} must be at least 512x512; found ${width}x${height}`);
  assert(logo.length <= 2_000_000, `${relativePath} should stay below 2 MB; found ${logo.length} bytes`);
  return { width, height };
}

function validateCommonManifest(manifest, relativePath) {
  assert(manifest && typeof manifest === "object", `${relativePath} must be a JSON object`);
  if (!manifest || typeof manifest !== "object") return;
  assert(manifest.name === "sideshift", `${relativePath} name must be sideshift`);
  assert(manifest.version === expectedVersion, `${relativePath} version must be ${expectedVersion}`);
  assert(typeof manifest.description === "string" && manifest.description.length >= 80, `${relativePath} description is too short`);
  assert(manifest.author?.name === "SideShift", `${relativePath} author.name must be SideShift`);
  assert(manifest.author?.email === "neev@sideshift.app", `${relativePath} author.email must be neev@sideshift.app`);
  assert(manifest.repository === expectedRepository, `${relativePath} repository URL is incorrect`);
  assert(manifest.homepage === expectedHomepage, `${relativePath} homepage URL is incorrect`);
  assert(manifest.license === "Apache-2.0", `${relativePath} license must be Apache-2.0`);
  assert(Array.isArray(manifest.keywords) && manifest.keywords.includes("sideshift") && manifest.keywords.includes("mcp"), `${relativePath} keywords must include sideshift and mcp`);
}

function validateManifestAsset(manifest, relativePath, fieldPath, rawPath) {
  assert(isSafeRelativePath(rawPath), `${relativePath} ${fieldPath} must be a safe relative path`);
  if (!isSafeRelativePath(rawPath)) return;
  const filePath = path.resolve(root, rawPath);
  assert(filePath.startsWith(`${root}${path.sep}`) && filePath !== root, `${relativePath} ${fieldPath} must stay inside the plugin archive`);
  assert(existsSync(filePath), `${relativePath} ${fieldPath} points to a missing file`);
}

function validateInterface(manifest, relativePath) {
  const iface = manifest?.interface;
  assert(iface && typeof iface === "object", `${relativePath} interface must be an object`);
  if (!iface || typeof iface !== "object") return;
  for (const field of ["displayName", "shortDescription", "longDescription", "developerName", "category"]) {
    assert(typeof iface[field] === "string" && iface[field].trim(), `${relativePath} interface.${field} must be non-empty`);
  }
  assert(Array.isArray(iface.capabilities) && iface.capabilities.every((item) => typeof item === "string" && item.trim()), `${relativePath} interface.capabilities must be an array of strings`);
  assert(Array.isArray(iface.defaultPrompt) && iface.defaultPrompt.length >= 1 && iface.defaultPrompt.length <= 3, `${relativePath} interface.defaultPrompt must contain one to three prompts`);
  for (const [index, prompt] of (iface.defaultPrompt ?? []).entries()) {
    assert(typeof prompt === "string" && prompt.trim() && prompt.length <= 128, `${relativePath} interface.defaultPrompt[${index}] must be non-empty and at most 128 characters`);
  }
  for (const field of ["websiteURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    assert(typeof iface[field] === "string" && iface[field].startsWith("https://"), `${relativePath} interface.${field} must be an https URL`);
  }
  assert(typeof iface.brandColor === "string" && /^#[0-9A-F]{6}$/i.test(iface.brandColor), `${relativePath} interface.brandColor must use #RRGGBB`);
  for (const field of ["composerIcon", "logo", "logoDark"]) {
    if (iface[field] !== undefined) validateManifestAsset(manifest, relativePath, `interface.${field}`, iface[field]);
  }
  for (const [index, screenshot] of (iface.screenshots ?? []).entries()) {
    validateManifestAsset(manifest, relativePath, `interface.screenshots[${index}]`, screenshot);
  }
}

function validateMcpConfig(config, relativePath) {
  assert(config && typeof config === "object", `${relativePath} must be a JSON object`);
  assert(Object.keys(config ?? {}).length === 1 && typeof config?.mcpServers === "object", `${relativePath} must have only the mcpServers root object`);
  assert(Object.keys(config?.mcpServers ?? {}).length === 1, `${relativePath} must declare exactly one server`);
  const server = config?.mcpServers?.sideshift;
  assert(server?.type === "http", `${relativePath} SideShift MCP transport type must be http`);
  assert(server?.url === expectedEndpoint, `${relativePath} SideShift MCP URL must be ${expectedEndpoint}`);
  assert(server && Object.keys(server).sort().join(",") === "type,url", `${relativePath} must remain secret-free and contain only type and url`);
}

async function validateNoUnsafeFiles() {
  const forbiddenNames = [".env", ".env.local", ".env.production", "credentials.json", "reviewer-credentials.json"];
  for (const name of forbiddenNames) {
    try {
      await fs.access(path.join(root, name));
      fail(`Forbidden secret-bearing file exists: ${name}`);
    } catch {
      // Expected.
    }
  }

  const textFiles = [
    ".cursor-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    "mcp.json",
    ".mcp.json",
    "README.md",
    "PRIVACY.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "skills/sideshift-operations/SKILL.md",
    "skills/sideshift-setup/SKILL.md",
    "commands/sideshift-connect.md",
    "docs/marketplace/README.md",
    "docs/marketplace/cursor-submission.md",
    "docs/marketplace/openai-submission.md",
    "docs/marketplace/claude-connector-submission.md",
    "docs/marketplace/claude-plugin-submission.md",
    "docs/marketplace/reviewer-test-plan.md",
  ];
  for (const relativePath of textFiles) {
    const content = await readText(relativePath);
    assert(!content.includes("firebasestorage.googleapis.com"), `${relativePath} must not depend on the temporary Firebase logo URL`);
    assert(!/-----BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY-----/.test(content), `${relativePath} must not contain a private key`);
    assert(!/Bearer\s+[A-Za-z0-9._~-]{30,}/.test(content), `${relativePath} must not contain a bearer token`);
  }
}

async function validateMarketplaceDossiers() {
  const files = [
    "docs/marketplace/README.md",
    "docs/marketplace/cursor-submission.md",
    "docs/marketplace/openai-submission.md",
    "docs/marketplace/claude-connector-submission.md",
    "docs/marketplace/claude-plugin-submission.md",
    "docs/marketplace/reviewer-test-plan.md",
  ];
  for (const relativePath of files) {
    const content = await readText(relativePath);
    assert(content.length >= 500, `${relativePath} is unexpectedly short`);
    assert(!content.includes("firebasestorage.googleapis.com"), `${relativePath} must not reference Firebase logo hosting`);
  }

  const tagline = "UGC and influencer campaigns in SideShift";
  assert(tagline.length <= 55, "Claude Connector tagline must be at most 55 characters");
  const claudeDescription = "SideShift is an end-to-end UGC and influencer marketing platform for brands and agencies. Connect Claude to your authorized SideShift workspace to discover and recruit creators, plan and manage campaigns, work with applications and offers, review content, coordinate contracts and deliverables, analyze creator and campaign performance, inspect financial records, and use the complete SideShift capability catalog through secure OAuth. The connector operates only within the company and scopes selected during authorization; it does not request or store an API key.";
  assert(claudeDescription.length <= 2_000, "Claude Connector description must be at most 2,000 characters");

  const openai = await readText("docs/marketplace/openai-submission.md");
  const cursor = await readText("docs/marketplace/cursor-submission.md");
  const claudeConnector = await readText("docs/marketplace/claude-connector-submission.md");
  const claudePlugin = await readText("docs/marketplace/claude-plugin-submission.md");
  for (const [relativePath, content] of [
    ["docs/marketplace/cursor-submission.md", cursor],
    ["docs/marketplace/openai-submission.md", openai],
    ["docs/marketplace/claude-connector-submission.md", claudeConnector],
    ["docs/marketplace/claude-plugin-submission.md", claudePlugin],
  ]) {
    for (const required of [expectedEndpoint, expectedRepository, "https://sideshift.app/privacy-policy", "https://sideshift.app/terms-of-service", "https://sideshift.app/contact"]) {
      assert(content.includes(required), `${relativePath} must include ${required}`);
    }
  }
  assert(claudeConnector.includes("mcp-review@anthropic.com"), "Claude Connector dossier must disclose the written financial-transaction exception path");
  assert(claudePlugin.includes("mcp-review@anthropic.com"), "Claude plugin dossier must disclose the written financial-transaction exception path");
  assert(openai.includes("OPENAI_APPS_CHALLENGE_TOKEN"), "OpenAI dossier must document the portal-generated challenge token");
  assert(openai.includes("Five positive") || openai.includes("Positive tests"), "OpenAI dossier must include positive reviewer tests");
  assert(openai.includes("Negative tests"), "OpenAI dossier must include negative reviewer tests");
}

async function main() {
  const cursorManifest = await readJson(".cursor-plugin/plugin.json");
  const codexManifest = await readJson(".codex-plugin/plugin.json");
  const claudeManifest = await readJson(".claude-plugin/plugin.json");
  const packageJson = await readJson("package.json");
  const cursorMcp = await readJson("mcp.json");
  const sharedMcp = await readJson(".mcp.json");

  validateCommonManifest(cursorManifest, ".cursor-plugin/plugin.json");
  validateCommonManifest(codexManifest, ".codex-plugin/plugin.json");
  validateCommonManifest(claudeManifest, ".claude-plugin/plugin.json");

  assert(cursorManifest?.displayName === "SideShift", "Cursor manifest displayName must be SideShift");
  assert(normalizeContractPath(cursorManifest?.mcpServers) === "mcp.json", "Cursor manifest mcpServers must resolve to mcp.json");
  assert(isSafeRelativePath(cursorManifest?.logo), "Cursor manifest logo must be a safe relative path");

  assert(normalizeContractPath(codexManifest?.skills) === "skills", "Codex manifest skills must resolve to skills/");
  assert(normalizeContractPath(codexManifest?.mcpServers) === ".mcp.json", "Codex manifest mcpServers must resolve to .mcp.json");
  validateInterface(codexManifest, ".codex-plugin/plugin.json");

  assert(normalizeContractPath(claudeManifest?.skills) === "skills", "Claude manifest skills must resolve to skills/");
  assert(normalizeContractPath(claudeManifest?.commands) === "commands", "Claude manifest commands must resolve to commands/");
  assert(normalizeContractPath(claudeManifest?.mcpServers) === ".mcp.json", "Claude manifest mcpServers must resolve to .mcp.json");

  assert(packageJson?.name === "@sideshift/mcp-plugin", "package.json name must be @sideshift/mcp-plugin");
  assert(packageJson?.version === expectedVersion, `package.json version must be ${expectedVersion}`);
  validateMcpConfig(cursorMcp, "mcp.json");
  validateMcpConfig(sharedMcp, ".mcp.json");
  assert(JSON.stringify(cursorMcp) === JSON.stringify(sharedMcp), "mcp.json and .mcp.json must be identical to preserve one endpoint");

  await validateComponent("skills/sideshift-operations/SKILL.md", "sideshift-operations");
  await validateComponent("skills/sideshift-setup/SKILL.md", "sideshift-setup");
  await validateComponent("commands/sideshift-connect.md", "sideshift-connect");
  const logo = await validateLogo("assets/logo.png");
  await validateNoUnsafeFiles();
  await validateMarketplaceDossiers();

  const requiredDisclosures = {
    "README.md": [expectedEndpoint, "https://sideshift.app/privacy-policy", "https://sideshift.app/terms-of-service", "https://sideshift.app/contact", "SECURITY.md"],
    "PRIVACY.md": [expectedEndpoint, "https://cursor.com/privacy", "https://sideshift.app/privacy-policy"],
    "LICENSE": ["Apache License", "Version 2.0"],
    ".github/SECURITY.md": ["private vulnerability reporting"],
  };
  for (const [relativePath, requiredStrings] of Object.entries(requiredDisclosures)) {
    const content = await readText(relativePath);
    for (const requiredString of requiredStrings) assert(content.includes(requiredString), `${relativePath} must include ${requiredString}`);
  }

  if (errors.length > 0) {
    console.error(`Cross-marketplace plugin validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Validated SideShift v${expectedVersion}: Cursor, OpenAI, and Claude manifests; one MCP endpoint; 2 skills; 1 command; ${logo.width}x${logo.height} repo-owned logo; marketplace dossiers.`);
}

await main();
