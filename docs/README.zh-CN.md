# API Auto MCP Server

API Auto MCP Server 是一个通过服务器的 OpenAPI 规范**自动生成Tools**的 MCP 服务器。它允许您的 AI 在无需编写任何代码的情况下访问你的服务的接口。

## 快速开始

可以访问 [api-auto-mcp-server-demo](https://github.com/RJiazhen/api-auto-mcp-server-demo) 以快速开始。

或者，您可以按照以下步骤为你的服务器设置 API Auto MCP Server：

### 使用 Cursor

将 `api-auto` MCP 服务器配置添加到您的 `.cursor/mcp.json` 文件中，记得将 URL 替换为自己的：

```json
{
  "mcpServers": {
    // ... 其他服务器
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

### 使用 Visual Studio Code

将以下内容添加到您的 `.vscode/mcp.json` 文件中，记得将 URL 替换为您自己的：

```json
{
  "servers": {
    // ... 其他服务器
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

## 开发

### 开发环境

- Node.js: >22.14.0
- Bun: >1.1.43

### 使用 Inspector 运行 MCP 服务器

```bash
npx @modelcontextprotocol/inspector bun dev --cwd D:/path/to/this/project --openapi-url your-openapi-json-url --cookie "<your-cookie-name>=<your-cookie-value>"
```

<!-- TODO: 完善开发文档 -->

## 许可证

MIT
