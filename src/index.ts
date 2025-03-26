#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./funding-assistant.js";

async function main() {
  const transport = new StdioServerTransport();
  const { server, cleanup } = createServer();
  await server.connect(transport);

  console.log("Server is running");
  // Cleanup on exit
  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});