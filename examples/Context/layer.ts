import {
  Context,
  Layer,
  Ref,
  Effect,
  HashMap,
  pipe,
  Console,
  type Cause,
} from "effect";

type UserStore = {
  getUserStore: () => Effect.Effect<HashMap.HashMap<string, string>>;
  getUser: (id: string) => Effect.Effect<string, Cause.NoSuchElementException>;
  removeUser: (id: string) => Effect.Effect<void>;
  setUser: (id: string, name: string) => Effect.Effect<void>;
  clearStore: () => Effect.Effect<void>;
};

class UserStoreContext extends Context.Tag("UserStoreContext")<
  UserStoreContext,
  UserStore
>() {}

const UserStoreLive = Layer.effect(
  UserStoreContext,
  pipe(
    Ref.make(HashMap.empty<string, string>()),
    Effect.map((userStoreRef) => {
      const getUserStore = () => Ref.get(userStoreRef);

      const getUser = (id: string) =>
        pipe(getUserStore(), Effect.flatMap(HashMap.get(id)));

      const removeUser = (id: string) =>
        Ref.update(userStoreRef, HashMap.remove(id));

      const setUser = (id: string, name: string) =>
        Ref.update(userStoreRef, HashMap.set(id, name));

      const clearStore = () =>
        Ref.set(userStoreRef, HashMap.empty<string, string>());

      return {
        getUserStore,
        getUser,
        removeUser,
        setUser,
        clearStore,
      };
    }),
  ),
);

const program = pipe(
  UserStoreContext,
  Effect.tap((userStore) =>
    pipe(
      userStore.getUserStore(),
      Effect.map(HashMap.size),
      Effect.flatMap((size) => Console.log("size", size)),
    ),
  ),

  Effect.tap((userStore) => userStore.setUser("1", "john")),
  Effect.tap((userStore) => userStore.setUser("2", "Mary")),
  Effect.tap((userStore) =>
    pipe(
      userStore.getUserStore(),
      Effect.map(HashMap.size),
      Effect.flatMap((size) => Console.log("size", size)),
    ),
  ),
  Effect.tap((userStore) =>
    pipe(
      userStore.getUser("1"),
      Effect.flatMap((name) => Console.log(`id: 1, name: ${name}`)),
    ),
  ),
  Effect.tap((userStore) =>
    pipe(
      userStore.getUser("2"),
      Effect.flatMap((name) => Console.log(`id: 2, name: ${name}`)),
    ),
  ),
  Effect.tap((userStore) => userStore.clearStore()),

  Effect.tap((userStore) =>
    pipe(
      userStore.getUserStore(),
      Effect.map(HashMap.size),
      Effect.flatMap((size) => Console.log("size", size)),
    ),
  ),
);

const runnable = Effect.provide(program, UserStoreLive);

Effect.runSync(runnable);
