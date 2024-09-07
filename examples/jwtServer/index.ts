import { Layer, pipe } from "effect";
import { HttpRouter, HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";

import { authRouter } from "./handler";

const router = pipe(HttpRouter.empty, HttpRouter.mount("/", authRouter));

const app = pipe(router, HttpServer.serve(), HttpServer.withLogAddress);

const ServerLive = NodeHttpServer.layerServer(() => createServer(), {
  port: 3000,
});

NodeRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)));
