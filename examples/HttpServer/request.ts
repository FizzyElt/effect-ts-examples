import { Effect, Layer, pipe } from "effect";
import {
  HttpServer,
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import {
  NodeHttpServer,
  NodeRuntime,
  NodeFileSystem,
  NodePath,
} from "@effect/platform-node";
import { createServer } from "node:http";

// 直接讀取 request 內容
const readRequest = pipe(
  HttpServerRequest.HttpServerRequest,
  Effect.flatMap((req) => {
    console.log(req);
    return HttpServerResponse.text("Hello World");
  }),
);

// 讀取 body json 內容
const readBodyRequest = pipe(
  HttpServerRequest.HttpServerRequest,
  Effect.flatMap((req) => req.json),
  Effect.flatMap((body) => HttpServerResponse.json(body)),
);

// 讀取 form 的內容
const readFormRequest = pipe(
  HttpServerRequest.HttpServerRequest,
  Effect.flatMap((req) => req.urlParamsBody),
  Effect.flatMap((paramsBody) =>
    HttpServerResponse.json(Object.fromEntries(paramsBody)),
  ),
);

// 建立 router
const router = pipe(
  HttpRouter.empty,
  HttpRouter.get("/", readRequest),
  HttpRouter.get("/readBody", readBodyRequest),
  HttpRouter.post("/readForm", readFormRequest),
);

// 建立 app
const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress);

// 建立一個 Node Http Server Layer
const ServerLive = NodeHttpServer.layerServer(() => createServer(), {
  port: 3000,
});

const MainLive = pipe(
  ServerLive,
  Layer.merge(NodeFileSystem.layer),
  Layer.merge(NodePath.layer),
);

// 執行 server
pipe(app, Layer.provide(MainLive), Layer.launch, NodeRuntime.runMain);
