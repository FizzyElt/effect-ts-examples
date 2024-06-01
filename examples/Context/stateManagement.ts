import { Ref, HashMap, Context, Effect, pipe, Console } from "effect";

type UserStore = HashMap.HashMap<string, string>;

type UserStoreService = Ref.Ref<UserStore>;

class UserStoreContext extends Context.Tag("UserStore")<
  UserStoreContext,
  UserStoreService
>() {}

const getUserStore = UserStoreContext.pipe(Effect.flatMap(Ref.get));

const getUser = (id: string) =>
  getUserStore.pipe(Effect.flatMap(HashMap.get(id)));

const setUser = (id: string, name: string) =>
  UserStoreContext.pipe(Effect.flatMap(Ref.update(HashMap.set(id, name))));

const clearUserStore = () =>
  UserStoreContext.pipe(Effect.flatMap(Ref.set(HashMap.empty())));

const program = pipe(
  Effect.void,
  Effect.tap(() =>
    pipe(
      getUserStore,
      Effect.map(HashMap.size),
      Effect.flatMap((size) => Console.log("size", size)),
    ),
  ),
  Effect.tap(() => setUser("1", "John")),
  Effect.tap(() => setUser("2", "Mary")),
  Effect.tap(() =>
    pipe(
      getUserStore,
      Effect.map(HashMap.size),
      Effect.flatMap((size) => Console.log("size", size)),
    ),
  ),
  Effect.tap(() =>
    pipe(
      getUser("1"),
      Effect.flatMap((name) => Console.log(`id: 1, name: ${name}`)),
    ),
  ),
  Effect.tap(() =>
    pipe(
      getUser("2"),
      Effect.flatMap((name) => Console.log(`id: 2, name: ${name}`)),
    ),
  ),

  Effect.tap(clearUserStore),
  Effect.tap(() =>
    pipe(
      getUserStore,
      Effect.map(HashMap.size),
      Effect.flatMap((size) => Console.log("size", size)),
    ),
  ),
);

const runnable = Effect.provideServiceEffect(
  program,
  UserStoreContext,
  Ref.make(HashMap.empty()),
);

Effect.runSync(runnable);
