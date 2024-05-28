import { Layer, pipe } from "effect";
import { HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";

// user router group
const userRouters = HttpServer.router.prefixAll(
  HttpServer.router.empty.pipe(
    HttpServer.router.get("/", HttpServer.response.text("user")),
    HttpServer.router.get("/hello", HttpServer.response.text("user hello")),
  ),
  "/user",
);

// product router group
const productRouters = HttpServer.router.prefixAll(
  HttpServer.router.empty.pipe(
    HttpServer.router.get("/", HttpServer.response.text("product")),
    HttpServer.router.get("/hello", HttpServer.response.text("product hello")),
  ),
  "/product",
);

// 合併所有 group
const router = pipe(
  HttpServer.router.empty,
  HttpServer.router.concat(userRouters),
  HttpServer.router.concat(productRouters),
);

// 建立 app
const app = router.pipe(
  HttpServer.server.serve(),
  HttpServer.server.withLogAddress,
);

// ==============================================

// 建立一個 Node Http Server Layer
const ServerLive = NodeHttpServer.server.layerServer(() => createServer(), {
  port: 3000,
});

// 執行 server
NodeRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)));
