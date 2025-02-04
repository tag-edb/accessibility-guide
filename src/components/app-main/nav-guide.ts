import { Guide, Chunk, Menu, Recipe, Item, getRoot, get } from "./guide";
import { Maybe } from "../../maybe";
import * as maybe from "../../maybe";

export type Path = number[];

export type State = { state: ChunkState; exhausted: boolean };

export type ChunkState = MenuState | RecipeState;
export type MenuState = [] | [number, ItemState];
export type RecipeState = [] | ItemState[];
export type ItemState = [] | [ChunkState];

export function expandItem(gde: Guide, state: State, index: number = 0): State {
  const chunk = (chnk: Chunk, state: ChunkState): Maybe<ChunkState> =>
    chnk.content.type === "menu"
      ? menu(chnk.content, state as MenuState)
      : recipe(chnk.content, state as RecipeState);

  const menu = (mnu: Menu, state: MenuState): Maybe<MenuState> =>
    state.length === 0
      ? index < mnu.items.length
        ? maybe.just([index, [[]]] as MenuState)
        : maybe.nothing()
      : item(mnu.items[state[0]], state[1]).map((itemState) => [
          state[0],
          itemState
        ]);

  const recipe = (rcpe: Recipe, state: RecipeState): Maybe<RecipeState> =>
    state.length === 0
      ? recipe(rcpe, [[]])
      : item(rcpe.items[state.length - 1], state[state.length - 1]).map(
          (itemState) => state.toSpliced(-1, 1, itemState)
        );

  const item = (itm: Item, state: ItemState): Maybe<ItemState> =>
    state.length === 0
      ? maybe.just([[]] as ItemState)
      : maybe
          .from(itm.ref)
          .andThen((ref) => get(gde, ref))
          .andThen((chnk) => chunk(chnk, state[0]))
          .map((chunkState) => [chunkState]);

  return getRoot(gde)
    .andThen((chnk) => chunk(chnk, state.state))
    .map((chunkState) => ({ state: chunkState, exhausted: false }))
    .withDefault({ state: state.state, exhausted: true });
}

export function nextItem(gde: Guide, state: State): State {
  const chunk = (chnk: Chunk, state: ChunkState): Maybe<ChunkState> =>
    chnk.content.type === "menu"
      ? menu(chnk.content, state as MenuState)
      : recipe(chnk.content, state as RecipeState);

  const menu = (mnu: Menu, state: MenuState): Maybe<MenuState> =>
    state.length === 0
      ? maybe.nothing()
      : item(mnu.items[state[0]], state[1]).map((itemState) => [
          state[0],
          itemState
        ]);

  const recipe = (rcpe: Recipe, state: RecipeState): Maybe<RecipeState> =>
    state.length === 0
      ? recipe(rcpe, [[]])
      : item(rcpe.items[state.length - 1], state[state.length - 1])
          .map((itemState) => state.toSpliced(-1, 1, itemState))
          .orElse(
            state.length < rcpe.items.length
              ? maybe.just([...state, [] as ItemState])
              : maybe.nothing()
          );

  const item = (itm: Item, state: ItemState): Maybe<ItemState> =>
    state.length === 0
      ? maybe.nothing()
      : maybe
          .from(itm.ref)
          .andThen((ref) => get(gde, ref))
          .andThen((chnk) => chunk(chnk, state[0]))
          .map((chunkState) => [chunkState]);

  return getRoot(gde)
    .andThen((chnk) => chunk(chnk, state.state))
    .map((chunkState) => ({ state: chunkState, exhausted: false }))
    .withDefault({ state: state.state, exhausted: true });
}
