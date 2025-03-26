# FluentLab Funding Assistant MCP Server

MCP Server for the FluentLab's Funding Assistant API.

## Tools

1. `get-funding-options`
    - Get available funding options
    - Optional inputs:
        - `limit` (number, default: 10, max: 100): Maximum number of funding options to return
        - `page` (number): Page number to retrieve
    - Returns: List of funding options with their ids, name, description, slug and information

2. `get-document-checklist-for-funding-programme'`
    - Get the required documents to apply for a funding programme
    - Required inputs:
        - `slug` (string): Unique slug defined by FluentLab for a funding option
    - Returns: List of required documents to apply for a funding programme

## Setup

### Usage with Claude Desktop

Add the following to your `claude_desktop_config.json`:

#### npx

```json
{
  "mcpServers": {
    "funding-assistant": {
      "command": "npx",
      "args": [
        "-y",
        "@fundfluent/funding-assistant"
      ]
    }
  }
}
```

### Troubleshooting

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.