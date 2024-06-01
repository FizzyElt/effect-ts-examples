import { Context, pipe, Effect, Console } from "effect";

type EnvVariables = {
  token: string;
  api_key: string;
};

class Env extends Context.Tag("Env")<Env, EnvVariables>() {}

const program = pipe(
  Effect.Do,
  Effect.bind("env", () => Env),
  Effect.flatMap(({ env }) => Console.log(env)),
);

const runnable = pipe(
  program,
  Effect.provideService(
    Env,
    // your implementation
    {
      token: "your token",
      api_key: "your api key",
    },
  ),
);

Effect.runSync(runnable);
