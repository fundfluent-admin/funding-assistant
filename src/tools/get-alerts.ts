import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NWS_API_BASE } from "../common.js";
import { formatAlert, makeNWSRequest } from "../nws/index.js";
import { AlertsResponse } from "../types/nws.js";
import { TTool } from "../types/index.js";

export class GetAlertsTool implements TTool {
  toolName = 'get-alerts';
  description = 'Get weather alerts for a state';

  register = (server: McpServer) => {
    server.tool(
      this.toolName,
      this.description,
      {
        state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
      },
      async ({ state }) => {
        const stateCode = state.toUpperCase();

        const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}&status=actual&limit=5`;
        const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

        if (!alertsData) {
          return {
            content: [
              {
                type: "text",
                text: "Failed to retrieve alerts data",
              },
            ],
          };
        }

        const features = alertsData.features || [];
        if (features.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No active alerts for ${stateCode}`,
              },
            ],
          };
        }

        const formattedAlerts = features.map(formatAlert);
        const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

        return {
          content: [
            {
              type: "text",
              text: alertsText,
            },
          ],
        };
      },
    );
  }
}