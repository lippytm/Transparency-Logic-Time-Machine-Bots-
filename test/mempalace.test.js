import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const services = JSON.parse(readFileSync(new URL('config/services.example.json', root), 'utf8'));
const mcp = JSON.parse(readFileSync(new URL('config/mempalace.mcp.example.json', root), 'utf8'));

test('MemPalace is opt-in and does not invent a cloud API or credentials', () => {
  const service = services.services.mempalace;
  assert.equal(service.enabled, false);
  assert.equal(service.transport, 'stdio');
  assert.deepEqual(service.requiredEnvVars, []);
  assert.deepEqual(service.optionalEnvVars, []);
  assert.equal(Object.hasOwn(service, 'apiKey'), false);
  assert.equal(Object.hasOwn(service, 'baseUrl'), false);
});

test('MemPalace MCP template matches the service registry', () => {
  assert.deepEqual(mcp.mcpServers.mempalace, {
    command: 'mempalace-mcp',
    args: [],
  });
  assert.equal(mcp.mcpServers.mempalace.command, services.services.mempalace.command);
  assert.deepEqual(mcp.mcpServers.mempalace.args, services.services.mempalace.args);
});

test('private memory paths are ignored while the MCP example is not ignored', () => {
  for (const path of [
    '.mempalace/private.txt',
    'mempalace-data/private.txt',
    'memory-imports/private.txt',
    'config/mempalace.mcp.json',
  ]) {
    assert.equal(
      execFileSync('git', ['check-ignore', '--no-index', path], {
        cwd: root,
        encoding: 'utf8',
      }).trim(),
      path
    );
  }
  const example = spawnSync(
    'git',
    ['check-ignore', '--no-index', 'config/mempalace.mcp.example.json'],
    {
      cwd: root,
      encoding: 'utf8',
    }
  );
  assert.equal(example.status, 1);
  assert.equal(example.stdout, '');
  assert.equal(example.stderr, '');
});
