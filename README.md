# API Auto MCP Server

API Auto MCP Server is a MCP Server **auto generate tool** by your server's OpenAPI specification. It allow your AI to access your server's API without writing any code.

## Quick Start

You can visit the [api-auto-mcp-server-demo](https://github.com/RJiazhen/api-auto-mcp-server-demo) for a quick start.

Or you can follow the steps below to set up the API Auto MCP Server for your own server:

### With Cursor

Add the `api-auto` mcp server config to your `.cursor/mcp.json`, remember change the url to your own:

```json
{
  "mcpServers": {
    // ... other servers
    "api-auto": {
      "command": "npx",
      "args": [
        "-y",
        "api-auto-mcp-server",
        "--openapi-url",
        "http://your-openapi-json-url",
        "--cookie",
        "auth=your-cookie-here"
      ]
    }
  }
}
```

### With Visual Studio Code

Add this to your `.vscode/mcp.json`, remember change the url to your own:

```json
{
  "servers": {
    // ... other servers
    "auto-api": {
      "command": "npx",
      "args": [
        "-y",
        "api-auto-mcp-server",
        "--openapi-url",
        "http://your-openapi-json-url",
        "--cookie",
        "auth=your-cookie-value"
      ]
    }
  }
}
```

## Development

<!-- TODO -->

### Develop Environment

- Node.js: >22.14.0
- Bun: >1.1.43

### Run the MCP server by inspector

```bash
npx @modelcontextprotocol/inspector bun dev --cwd D:/path/to/this/project --openapi-url your-openapi-json-url --cookie "<your-cookie-name>=<your-cookie-value>"
```


## License

MIT
