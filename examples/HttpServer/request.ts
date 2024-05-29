import { Effect, Layer, pipe } from "effect";
import { HttpServer, FileSystem, Path } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";
import { Schema } from "@effect/schema";

// 直接讀取 request 內容
const readRequest = pipe(
  HttpServer.request.ServerRequest,
  Effect.flatMap((req) => {
    console.log(req);
    return HttpServer.response.text("Hello World");
  }),
);

// 讀取 body json 內容
const readBodyRequest = pipe(
  HttpServer.request.ServerRequest,
  Effect.flatMap((req) => req.json),
  Effect.flatMap((body) => HttpServer.response.json(body)),
);

// 讀取 body json 內容
const readFormRequest = pipe(
  HttpServer.request.schemaBodyForm(Schema.Struct({})),
  Effect.flatMap((body) => HttpServer.response.json(body)),
);

// 建立 router
const router = pipe(
  HttpServer.router.empty,
  HttpServer.router.get("/", readRequest),
  HttpServer.router.get("/readBody", readBodyRequest),
  HttpServer.router.post("/readForm", readFormRequest),
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
// @ts-ignore
NodeRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)));
