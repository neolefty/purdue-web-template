# MCP PostgreSQL Setup

This document describes how to set up the PostgreSQL MCP server for this project to enable Claude Code to directly query the database.

## Status: In Progress

The PostgreSQL port has been exposed in `compose.yml` and a project config file has been created in `.mcp.json`, but the global Claude Code configuration still needs to be updated.

## What's Done

- ✅ Added PostgreSQL port mapping to `compose.yml` (configurable via `DB_HOST_PORT` in `.env`)
- ✅ Created `.mcp.json` with project MCP configuration using port 5433

## What's Left to Do

### 1. Restart Docker to Expose PostgreSQL Port

```bash
docker compose down && docker compose up -d
```

### 2. Configure Claude Code Globally

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@henkey/postgres-mcp-server",
        "--connection-string",
        "postgresql://postgres:postgres@localhost:5433/purdue_app"
      ]
    }
  }
}
```

**Note:** If the file already exists with other MCP servers, just add the `"postgres"` entry to the existing `"mcpServers"` object.

### 3. Restart Claude Code

After updating the config, completely restart Claude Code for the changes to take effect.

## About the MCP Server

We're using **@henkey/postgres-mcp-server** because:
- The official `@modelcontextprotocol/server-postgres` package is deprecated
- This is a recently redesigned, actively maintained alternative
- Provides comprehensive PostgreSQL database management capabilities

## Connection Details

From `.env` file:
- **Database**: `purdue_app`
- **User**: `postgres`
- **Password**: `postgres`
- **Host**: `localhost`
- **Port**: Default is 5432, but change `DB_HOST_PORT` in `.env` to 5433 if port 5432 is already in use

## Testing

Once configured, Claude Code should have PostgreSQL tools available to:
- Inspect database schemas
- Execute queries
- Analyze data
- Support development tasks

## Notes

- The `.mcp.json` file in this project serves as documentation only
- Claude Code currently requires MCP servers to be configured globally
- The PostgreSQL port is now exposed to localhost for MCP access
