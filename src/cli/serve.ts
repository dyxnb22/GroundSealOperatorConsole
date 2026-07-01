#!/usr/bin/env node
import { MemoryStore } from "../adapters/memory-store.js";
import { FileStore } from "../adapters/file-store.js";
import { createGsocHttpServer } from "../adapters/http-server.js";

const port = Number(process.env.GSOC_PORT ?? 3100);
const host = process.env.GSOC_HOST ?? "127.0.0.1";
const storePath = process.env.GSOC_STORE_PATH;

const store = storePath ? new FileStore(storePath) : new MemoryStore();
const app = createGsocHttpServer({ store, port, host });

const { port: boundPort, host: boundHost } = await app.listen();
console.log(`GroundSealOperatorConsole API listening on http://${boundHost}:${boundPort}`);
