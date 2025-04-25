# api-auto-mcp-server

<!-- TODO -->

## Usage

### With Visual Studio Code

Add this to your `mcp.json`

```
"servers": {
  "auto-api": {
    "command": "npx",
    "args": [
      "-y",
      "--openapi-url",
      "your-openapi-json-url",
      "--cookie",
      "your-cookie-name=your-cookie-value"
    ]
  }
}
```

### With Cursor

Add a new MCP server by command:
```bash
npx -y api-auto-mcp-server --openapi-url <your-openapi-json-url> --cookie <your-cookie-name>=<your-cookie-value>
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
