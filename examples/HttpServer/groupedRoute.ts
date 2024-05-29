import { Effect, Layer, pipe } from "effect";
import { HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";

// user router group
const userRouters = pipe(
  HttpServer.router.empty,
  HttpServer.router.get("/", HttpServer.response.text("user")),
  HttpServer.router.get("/hello", HttpServer.response.text("user hello")),
  HttpServer.router.prefixAll("/user"),
);

// product router group
const productRouters = pipe(
  HttpServer.router.empty,
  HttpServer.router.get("/", HttpServer.response.text("product")),
  HttpServer.router.get("/hello", HttpServer.response.text("product hello")),
  HttpServer.router.prefixAll("/product"),
);

const pageRouters = pipe(
  HttpServer.router.empty,
  HttpServer.router.get(
    "/:pageNum",
    pipe(
      HttpServer.router.params,
      Effect.flatMap(({ pageNum }) =>
        HttpServer.response.text(`page ${pageNum}`),
      ),
    ),
  ),
);

const categoryRouters = pipe(
  HttpServer.router.empty,
  HttpServer.router.get(
    "/:categoryId",
    pipe(
      HttpServer.router.params,
      Effect.flatMap(({ categoryId }) =>
        HttpServer.response.text(`category ${categoryId}`),
      ),
    ),
  ),
);

// 利用 mount 將目標 router group 起來
const categoryPageRouters = pipe(
  HttpServer.router.empty,
  // categoryRouters 底下的路由都會被加上 category
  HttpServer.router.mount("/category", categoryRouters),
  // pageRouters 底下的路由都會被加上 page
  HttpServer.router.mount("/page", pageRouters),
);

// 合併所有 group
const router = pipe(
  HttpServer.router.empty,
  HttpServer.router.concat(userRouters),
  HttpServer.router.concat(productRouters),
  HttpServer.router.concat(categoryPageRouters),
);

// 建立 app
const app = pipe(
  router,
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
