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


## License

MIT
