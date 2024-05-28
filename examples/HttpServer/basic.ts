import { Layer } from "effect";
import { HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";

// 建立 router
const router = HttpServer.router.empty.pipe(
  HttpServer.router.get("/", HttpServer.response.text("Hello World")),
);

// 建立 app
const app = router.pipe(
  HttpServer.server.serve(),
  HttpServer.server.withLogAddress,
);

// 建立一個 Node Http Server Layer
const ServerLive = NodeHttpServer.server.layerServer(() => createServer(), {
  port: 3000,
});

// 執行 server
NodeRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)));
