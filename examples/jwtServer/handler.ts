import { pipe, Effect, flow } from "effect";
import { TaggedError } from "effect/Data";
import { Schema } from "@effect/schema";
import {
  HttpRouter,
  HttpServerResponse,
  HttpServerRequest,
  HttpMiddleware,
} from "@effect/platform";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = "secret";

class JwtError extends TaggedError("JwtError") {}

const userSchema = Schema.Struct({
  name: Schema.String,
  password: Schema.String,
});

const validateHeader = Schema.Struct({
  authorization: Schema.String,
});

export const loginHandler = HttpRouter.post(
  "/login",
  pipe(
    HttpServerRequest.schemaBodyJson(userSchema),
    Effect.map((body) => sign(body, JWT_SECRET, { expiresIn: "1h" })),
    Effect.tap((token) => HttpServerResponse.setCookie("token", token)),
    Effect.flatMap((token) => HttpServerResponse.json({ token })),
  ),
);

export const jwtValidator = HttpMiddleware.make((app) =>
  pipe(
    app,
    Effect.tap(() =>
      pipe(
        HttpServerRequest.schemaHeaders(validateHeader),
        Effect.tryMap({
          try: ({ authorization }) => verify(authorization, JWT_SECRET),
          catch: () => new JwtError(),
        }),
      ),
    ),
  ).pipe(
    Effect.catchTag("JwtError", () =>
      HttpServerResponse.text("Jwt validate error").pipe(
        HttpServerResponse.setStatus(401),
      ),
    ),
    Effect.catchTag("ParseError", () =>
      HttpServerResponse.text("parse error").pipe(
        HttpServerResponse.setStatus(400),
      ),
    ),
    Effect.catchAll(() =>
      HttpServerResponse.text("unknown error").pipe(
        HttpServerResponse.setStatus(500),
      ),
    ),
  ),
);

export const userRouter = HttpRouter.empty.pipe(
  HttpRouter.get("/user", HttpServerResponse.text("success")),
  HttpRouter.use(flow(jwtValidator)),
);

export const authRouter = pipe(userRouter, loginHandler);
