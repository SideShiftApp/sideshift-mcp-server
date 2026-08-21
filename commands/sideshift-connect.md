---
name: sideshift-connect
description: Connect SideShift through browser-based OAuth, verify the selected company, and report the granted scopes without requesting or exposing credentials.
---

# Connect SideShift

1. Check whether the `sideshift` MCP server and its `whoami` tool are available.
2. If they are available, call `whoami`. The first call may open SideShift's OAuth consent flow in the user's browser or host connection UI.
3. Ask the user to complete sign-in, choose the intended company, review the requested scopes, and approve. Do not ask the user to paste any token or secret into chat.
4. After authorization completes, call `whoami` again.
5. Report:
   - the exact connected company name and ID;
   - whether the connection is sandboxed;
   - the granted scopes relevant to the user's intended work;
   - any missing scope that requires reauthorization.
6. Do not perform another SideShift action until the user confirms that the reported company is the intended one.

If the SideShift MCP server is unavailable, ask the user to enable or reinstall the SideShift plugin in the current host and reload its plugins/connections, then retry `whoami`. Do not add a second manual MCP definition or create an API-key fallback.
