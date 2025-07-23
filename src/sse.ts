import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "./funding-assistant.js";
import express from "express";

const app = express();

const { server, cleanup } = createServer();

let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  console.log("Received connection");
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);

  // Handle connection cleanup (TODO: implement proper connection handling)
});

app.post("/message", async (req, res) => {
  console.log("Received message");

  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});