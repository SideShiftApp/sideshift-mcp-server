#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedEndpoint = "https://app.sideshift.app/api/mcp";
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
  return normalized !== ".." && !normalized.startsWith("../");
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

async function validateNoUnsafeFiles() {
  const tracked = (await fs.readFile(path.join(root, ".git", "index"))).length > 0;
  assert(tracked, "Git index is unavailable");

  const forbiddenNames = [".env", ".env.local", ".env.production", "credentials.json"];
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
    "mcp.json",
    "README.md",
    "PRIVACY.md",
    "CONTRIBUTING.md",
    "skills/sideshift-operations/SKILL.md",
    "commands/sideshift-connect.md",
  ];
  for (const relativePath of textFiles) {
    const content = await readText(relativePath);
    assert(
      !content.includes("firebasestorage.googleapis.com"),
      `${relativePath} must not depend on the temporary Firebase logo URL`,
    );
  }
}

async function main() {
  const manifest = await readJson(".cursor-plugin/plugin.json");
  const mcpConfig = await readJson("mcp.json");
  const packageJson = await readJson("package.json");

  if (manifest) {
    assert(/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(manifest.name), "manifest name must be lowercase kebab-case");
    assert(manifest.name === "sideshift", "manifest name must be sideshift");
    assert(manifest.displayName === "SideShift", "manifest displayName must be SideShift");
    assert(/^\d+\.\d+\.\d+$/.test(manifest.version), "manifest version must be semantic x.y.z");
    assert(manifest.version === packageJson?.version, "manifest and package versions must match");
    assert(typeof manifest.description === "string" && manifest.description.length >= 80, "manifest description is too short");
    assert(manifest.description.length <= 240, "manifest description should stay at or below 240 characters");
    assert(manifest.author?.name === "SideShift", "manifest author.name must be SideShift");
    assert(manifest.author?.email === "neev@sideshift.app", "manifest author.email must be neev@sideshift.app");
    assert(manifest.license === "Apache-2.0", "manifest license must be Apache-2.0");
    assert(manifest.repository === "https://github.com/SideShiftApp/sideshift-mcp-server", "manifest repository URL is incorrect");
    assert(manifest.homepage === "https://docs.sideshift.app/mcp-server", "manifest homepage URL is incorrect");
    assert(isSafeRelativePath(manifest.logo), "manifest logo must be a safe relative path");
    assert(isSafeRelativePath(manifest.mcpServers), "manifest mcpServers must be a safe relative path");
    assert(Array.isArray(manifest.keywords) && manifest.keywords.includes("sideshift") && manifest.keywords.includes("mcp"), "manifest keywords must include sideshift and mcp");
  }

  if (mcpConfig) {
    assert(Object.keys(mcpConfig).length === 1 && typeof mcpConfig.mcpServers === "object", "mcp.json must have only the mcpServers root object");
    assert(Object.keys(mcpConfig.mcpServers ?? {}).length === 1, "mcp.json must declare exactly one server");
    const server = mcpConfig.mcpServers?.sideshift;
    assert(server?.type === "http", "SideShift MCP transport type must be http");
    assert(server?.url === expectedEndpoint, `SideShift MCP URL must be ${expectedEndpoint}`);
    assert(server && Object.keys(server).sort().join(",") === "type,url", "SideShift MCP config must remain secret-free and contain only type and url");
  }

  await validateComponent("skills/sideshift-operations/SKILL.md", "sideshift-operations");
  await validateComponent("commands/sideshift-connect.md", "sideshift-connect");
  const logo = await validateLogo(manifest?.logo ?? "assets/logo.png");
  await validateNoUnsafeFiles();

  const requiredDisclosures = {
    "README.md": [
      expectedEndpoint,
      "https://sideshift.app/privacy-policy",
      "https://sideshift.app/terms-of-service",
      "https://sideshift.app/contact",
      "SECURITY.md",
    ],
    "PRIVACY.md": [expectedEndpoint, "https://cursor.com/privacy"],
    "LICENSE": ["Apache License", "Version 2.0"],
    ".github/SECURITY.md": ["private vulnerability reporting"],
  };
  for (const [relativePath, requiredStrings] of Object.entries(requiredDisclosures)) {
    const content = await readText(relativePath);
    for (const requiredString of requiredStrings) {
      assert(content.includes(requiredString), `${relativePath} must include ${requiredString}`);
    }
  }

  if (errors.length > 0) {
    console.error(`Plugin validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Validated SideShift Cursor plugin: 1 MCP server, 1 skill, 1 command, ${logo.width}x${logo.height} repo-owned logo.`);
}

await main();
