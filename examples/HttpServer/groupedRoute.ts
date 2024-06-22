import { Effect, Layer, pipe } from "effect";
import { HttpServer, HttpRouter, HttpServerResponse } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";

// user router group
const userRouters = pipe(
  HttpRouter.empty,
  HttpRouter.get("/", HttpServerResponse.text("user")),
  HttpRouter.get("/hello", HttpServerResponse.text("user hello")),
  HttpRouter.prefixAll("/user"),
);

// product router group
const productRouters = pipe(
  HttpRouter.empty,
  HttpRouter.get("/", HttpServerResponse.text("product")),
  HttpRouter.get("/hello", HttpServerResponse.text("product hello")),
  HttpRouter.prefixAll("/product"),
);

const pageRouters = pipe(
  HttpRouter.empty,
  HttpRouter.get(
    "/:pageNum",
    pipe(
      HttpRouter.params,
      Effect.flatMap(({ pageNum }) =>
        HttpServerResponse.text(`page ${pageNum}`),
      ),
    ),
  ),
);

const categoryRouters = pipe(
  HttpRouter.empty,
  HttpRouter.get(
    "/:categoryId",
    pipe(
      HttpRouter.params,
      Effect.flatMap(({ categoryId }) =>
        HttpServerResponse.text(`category ${categoryId}`),
      ),
    ),
  ),
);

// 利用 mount 將目標 router group 起來
const categoryPageRouters = pipe(
  HttpRouter.empty,
  // categoryRouters 底下的路由都會被加上 category
  HttpRouter.mount("/category", categoryRouters),
  // pageRouters 底下的路由都會被加上 page
  HttpRouter.mount("/page", pageRouters),
);

// 合併所有 group
const router = pipe(
  HttpRouter.empty,
  HttpRouter.concat(userRouters),
  HttpRouter.concat(productRouters),
  HttpRouter.concat(categoryPageRouters),
);

// 建立 app
const app = pipe(router, HttpServer.serve(), HttpServer.withLogAddress);

// ==============================================

// 建立一個 Node Http Server Layer
const ServerLive = NodeHttpServer.layerServer(() => createServer(), {
  port: 3000,
});

// 執行 server
NodeRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)));
