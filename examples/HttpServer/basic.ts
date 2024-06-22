import { Layer } from "effect";
import { HttpServer, HttpRouter, HttpServerResponse } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";

// 建立 router
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", HttpServerResponse.text("Hello World")),
);

// 建立 app
const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress);

// 建立一個 Node Http Server Layer
const ServerLive = NodeHttpServer.layerServer(() => createServer(), {
  port: 3000,
});

// 執行 server
NodeRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)));
