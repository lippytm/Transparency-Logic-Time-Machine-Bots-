import { test } from 'node:test';
import assert from 'node:assert';
import {
  SearchService,
  PineconeAdapter,
  WeaviateAdapter,
  ChromaAdapter,
  createVectorDatabase,
} from '../dist/search/index.js';

test('SearchService can be created', () => {
  const service = new SearchService({
    enabled: false,
    type: 'pinecone',
  });
  assert.ok(service, 'SearchService should be created');
});

test('SearchService initialization when disabled', async () => {
  const service = new SearchService({
    enabled: false,
  });
  await assert.doesNotReject(service.initialize(), 'Should not throw when disabled');
});

test('SearchService requires type when enabled', async () => {
  const service = new SearchService({
    enabled: true,
  });
  await assert.rejects(
    service.initialize(),
    /Vector database type is required/,
    'Should throw when type is missing'
  );
});

test('SearchService initialization with Pinecone', async () => {
  const service = new SearchService({
    enabled: true,
    type: 'pinecone',
    apiKey: 'test-key',
  });
  await assert.doesNotReject(service.initialize(), 'Should initialize with Pinecone');

  // Verify service is usable after initialization
  const results = await service.searchByVector([0.1, 0.2]);
  assert.ok(Array.isArray(results), 'Should be able to search after initialization');

  await service.close();
});

test('SearchService initialization with Weaviate', async () => {
  const service = new SearchService({
    enabled: true,
    type: 'weaviate',
    endpoint: 'http://localhost:8080',
  });
  await assert.doesNotReject(service.initialize(), 'Should initialize with Weaviate');

  // Verify service is usable after initialization
  const results = await service.searchByText('test');
  assert.ok(Array.isArray(results), 'Should be able to search after initialization');

  await service.close();
});

test('SearchService initialization with Chroma', async () => {
  const service = new SearchService({
    enabled: true,
    type: 'chroma',
    endpoint: 'http://localhost:8000',
  });
  await assert.doesNotReject(service.initialize(), 'Should initialize with Chroma');

  // Verify service is usable after initialization
  const results = await service.searchByVector([0.3, 0.7]);
  assert.ok(Array.isArray(results), 'Should be able to search after initialization');

  await service.close();
});

test('SearchService supports searching by vector', async () => {
  const service = new SearchService({
    enabled: true,
    type: 'pinecone',
  });
  await service.initialize();

  const vector = [0.1, 0.2, 0.3, 0.4];
  const results = await service.searchByVector(vector, 5);
  assert.ok(Array.isArray(results), 'Should return array of results');
  await service.close();
});

test('SearchService supports searching by text', async () => {
  const service = new SearchService({
    enabled: true,
    type: 'weaviate',
  });
  await service.initialize();

  const results = await service.searchByText('test query', 5);
  assert.ok(Array.isArray(results), 'Should return array of results');
  await service.close();
});

test('SearchService throws when not initialized', async () => {
  const service = new SearchService({
    enabled: true,
    type: 'pinecone',
  });

  await assert.rejects(
    service.searchByVector([0.1, 0.2]),
    /not initialized/,
    'Should throw when not initialized'
  );
});

test('createVectorDatabase factory creates correct adapter', () => {
  const pinecone = createVectorDatabase('pinecone', {});
  assert.ok(pinecone instanceof PineconeAdapter, 'Should create PineconeAdapter');

  const weaviate = createVectorDatabase('weaviate', {});
  assert.ok(weaviate instanceof WeaviateAdapter, 'Should create WeaviateAdapter');

  const chroma = createVectorDatabase('chroma', {});
  assert.ok(chroma instanceof ChromaAdapter, 'Should create ChromaAdapter');
});

test('Both search methods work - vector and text', async () => {
  const service = new SearchService({
    enabled: true,
    type: 'chroma',
  });
  await service.initialize();

  // First way: search by vector
  const vectorResults = await service.searchByVector([0.5, 0.5, 0.5]);
  assert.ok(Array.isArray(vectorResults), 'Vector search should return results');

  // Second way: search by text
  const textResults = await service.searchByText('find this item');
  assert.ok(Array.isArray(textResults), 'Text search should return results');

  await service.close();
});
