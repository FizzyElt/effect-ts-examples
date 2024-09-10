import { Effect, Layer } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApi,
  HttpApiBuilder,
  HttpRouter,
  HttpServerResponse,
} from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";
import { Schema } from "@effect/schema";

// endpoint
const rootApi = HttpApiGroup.make("root").pipe(
  HttpApiGroup.add(
    HttpApiEndpoint.get("echo", "/root").pipe(
      HttpApiEndpoint.setSuccess(Schema.String),
    ),
  ),
);

const api = HttpApi.empty.pipe(HttpApi.addGroup(rootApi));

const EndpointApiLive = HttpApiBuilder.group(api, "root", (handlers) =>
  handlers.pipe(
    HttpApiBuilder.handle("echo", () => Effect.succeed("hell world")),
  ),
);

const MyApiLive = HttpApiBuilder.api(api).pipe(Layer.provide(EndpointApiLive));

// router
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/route", HttpServerResponse.text("Hello World")),
);

const RouterLive = HttpApiBuilder.Router.use((_) => _.concat(router));

// server
const HttpLive = HttpApiBuilder.serve().pipe(
  Layer.provide(MyApiLive),
  Layer.provide(RouterLive),
);

const ServerLive = NodeHttpServer.layer(createServer, { port: 3000 });

Layer.launch(Layer.provide(HttpLive, ServerLive)).pipe(NodeRuntime.runMain);
