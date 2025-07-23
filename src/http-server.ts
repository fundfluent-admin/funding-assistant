#!/usr/bin/env node

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./funding-assistant.js";
import express from "express";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());

async function main() {
  const { server, cleanup } = createServer();

  // Transport configuration from environment variables
  const allowedHosts = process.env.MCP_ALLOWED_HOSTS?.split(',') || ['127.0.0.1', 'localhost'];
  const allowedOrigins = process.env.MCP_ALLOWED_ORIGINS?.split(',') || ['*'];
  const enableSessions = process.env.MCP_ENABLE_SESSIONS !== 'false'; // Default to true
  const enableDnsRebinding = process.env.MCP_ENABLE_DNS_REBINDING !== 'false'; // Default to true
  
  const PORT = process.env.PORT || 3500;

  console.log(`Transport Configuration:`);
  console.log(`- Sessions enabled: ${enableSessions}`);
  console.log(`- DNS rebinding protection: ${enableDnsRebinding}`);
  console.log(`- Allowed hosts: ${allowedHosts.join(', ')}`);
  console.log(`- Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`- Port: ${PORT}`);

  // Create streamable HTTP transport
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: enableSessions ? () => randomUUID() : undefined,
    onsessioninitialized: (sessionId) => {
      console.log(`MCP session initialized: ${sessionId}`);
    },
    onsessionclosed: (sessionId) => {
      console.log(`MCP session closed: ${sessionId}`);
    },
    enableDnsRebindingProtection: enableDnsRebinding,
    allowedHosts,
    allowedOrigins
  });

  // Connect the server to the transport with error handling
  try {
    await server.connect(transport);
    console.log(`✅ MCP server connected to StreamableHTTP transport successfully`);
  } catch (error) {
    console.error(`❌ Failed to connect MCP server to transport:`, error);
    process.exit(1);
  }

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      transport: "StreamableHTTP",
      version: process.env.npm_package_version || "unknown"
    });
  });

  // Configuration endpoint (for debugging)
  app.get("/config", (req, res) => {
    res.json({ 
      server: {
        name: "@fluentlab/funding-assistant",
        version: process.env.npm_package_version || "unknown",
        transport: "StreamableHTTPServerTransport"
      },
      configuration: {
        sessionsEnabled: enableSessions,
        dnsRebindingProtection: enableDnsRebinding,
        allowedHosts: allowedHosts,
        allowedOrigins: allowedOrigins,
        port: PORT
      },
      endpoints: {
        health: "/health",
        config: "/config", 
        mcp: "/mcp",
        methods: ["GET", "POST", "DELETE", "OPTIONS"]
      },
      timestamp: new Date().toISOString()
    });
  });

  // Handle MCP POST requests
  app.post("/mcp", async (req, res) => {
    const requestId = randomUUID().substring(0, 8);
    console.log(`[${requestId}] Received MCP POST request`);
    
    try {
      // Set CORS headers for all origins
      const corsOrigin = req.headers.origin && allowedOrigins.includes('*') 
        ? req.headers.origin 
        : allowedOrigins[0];
        
      res.header("Access-Control-Allow-Origin", corsOrigin || "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");

      // Let the streamable HTTP transport handle the request
      console.log(`[${requestId}] Processing request through transport`);
      await transport.handleRequest(req, res, req.body);
      console.log(`[${requestId}] Request completed`);
      
    } catch (error) {
      console.error(`[${requestId}] MCP request error:`, error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
          requestId
        });
      }
    }
  });

  // Handle MCP GET requests (for SSE streams)
  app.get("/mcp", async (req, res) => {
    const requestId = randomUUID().substring(0, 8);
    console.log(`[${requestId}] Received MCP GET request for SSE stream`);
    
    try {
      // Set CORS headers
      const corsOrigin = req.headers.origin && allowedOrigins.includes('*') 
        ? req.headers.origin 
        : allowedOrigins[0];
        
      res.header("Access-Control-Allow-Origin", corsOrigin || "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");

      // Let the streamable HTTP transport handle the request
      console.log(`[${requestId}] Processing SSE stream through transport`);
      await transport.handleRequest(req, res, req.body);
      console.log(`[${requestId}] SSE stream established`);
      
    } catch (error) {
      console.error(`[${requestId}] MCP SSE request error:`, error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
          requestId
        });
      }
    }
  });

  // Handle MCP DELETE requests (for session termination)
  app.delete("/mcp", async (req, res) => {
    const requestId = randomUUID().substring(0, 8);
    console.log(`[${requestId}] Received MCP DELETE request for session termination`);
    
    try {
      // Set CORS headers
      const corsOrigin = req.headers.origin && allowedOrigins.includes('*') 
        ? req.headers.origin 
        : allowedOrigins[0];
        
      res.header("Access-Control-Allow-Origin", corsOrigin || "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");

      // Let the streamable HTTP transport handle the request
      console.log(`[${requestId}] Processing session termination through transport`);
      await transport.handleRequest(req, res, req.body);
      console.log(`[${requestId}] Session terminated`);
      
    } catch (error) {
      console.error(`[${requestId}] MCP DELETE request error:`, error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
          requestId
        });
      }
    }
  });

  // Handle OPTIONS for CORS
  app.options("/mcp", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(200).end();
  });

  const httpServer = app.listen(PORT, () => {
    console.log(`🚀 StreamableHTTP MCP Server is running on port ${PORT}`);
    console.log(`📋 Endpoints:`);
    console.log(`   - Health check: http://localhost:${PORT}/health`);
    console.log(`   - Configuration: http://localhost:${PORT}/config`);
    console.log(`   - MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`🔧 Transport: StreamableHTTPServerTransport`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down StreamableHTTP server...");
    httpServer.close();
    await cleanup();
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("StreamableHTTP Server error:", error);
  process.exit(1);
});