import { Maybe } from "../../maybe";
import * as maybe from "../../maybe";
import { Guide, Chunk, Menu, Recipe, Item } from "./guide";
import * as guide from "./guide";
import {
  ChunkState,
  State,
  MenuState,
  RecipeState,
  ItemState
} from "./nav-guide";

export type GuideUI = {
  type: "guide";
  root: ChunkUI;
  coda: Maybe<string>;
};

export type ChunkUI = MenuUI | RecipeUI;

export type MenuUI = {
  type: "menu";
  prompt: string;
  current: boolean;
  choices: ChoiceUI[];
};

export type ChoiceUI = {
  type: "choice";
  text: string;
  children: ChunkUI[];
};

export type RecipeUI = {
  type: "recipe";
  steps: StepUI[];
};

export type StepUI = {
  type: "step";
  text: string;
  current: boolean;
  expand: Maybe<ChoiceUI>;
  next: ChoiceUI;
};

export function createUI(gde: Guide, state: State): Maybe<GuideUI> {
  const root = (rt: Chunk): GuideUI => ({
    type: "guide",
    root: chunk(rt, state.state, !state.exhausted),
    coda: state.exhausted ? maybe.just("YOU'VE FINISHED!") : maybe.nothing()
  });

  const chunk = (
    chnk: Chunk,
    chunkState: ChunkState,
    current: boolean
  ): ChunkUI =>
    chnk.content.type === "menu"
      ? menu(chnk.content, chunkState as MenuState, current)
      : recipe(chnk.content, chunkState as RecipeState, current);

  const menu = (mnu: Menu, menuState: MenuState, current: boolean): MenuUI => ({
    type: "menu",
    prompt: mnu.title,
    current: current && menuState.length === 0,
    choices: mnu.items.map((itm, idx) =>
      menuItem(
        itm,
        menuState.length === 0 || menuState[0] !== idx ? [] : menuState[1],
        current && (menuState.length === 0 || menuState[0] === idx)
      )
    )
  });

  const menuItem = (
    itm: Item,
    itemState: ItemState,
    current: boolean
  ): ChoiceUI => ({
    type: "choice",
    text: itemText(itm),
    children:
      itemState.length === 0
        ? []
        : itemLink(itm)
            .map((chnk) => [chunk(chnk, itemState[0], current)])
            .withDefault([])
  });

  const recipe = (
    rcpe: Recipe,
    recipeState: RecipeState,
    current: boolean
  ): RecipeUI =>
    recipeState.length === 0
      ? recipe(rcpe, [[]], current)
      : {
          type: "recipe",
          steps: rcpe.items
            .slice(0, recipeState.length)
            .map((itm, idx) =>
              step(
                itm,
                recipeState[idx],
                current && idx === recipeState.length - 1
              )
            )
        };

  const step = (itm: Item, itemState: ItemState, current: boolean): StepUI => ({
    type: "step",
    current: current && itemState.length === 0,
    text: itemText(itm),
    expand:
      itm.ref !== null
        ? maybe.just({
            type: "choice" as "choice",
            text: "HOW DO I DO THAT?",
            children:
              itemState.length === 0
                ? []
                : itemLink(itm)
                    .map((chnk) => [chunk(chnk, itemState[0], current)])
                    .withDefault([])
          })
        : maybe.nothing(),
    next: {
      type: "choice",
      text: "OKAY, WHAT'S NEXT?",
      children: []
    }
  });

  const itemText = (itm: Item): string =>
    itm.text ??
    itemLink(itm)
      .map((chnk) => chnk.content.title)
      .withDefault("MISSING REFERENCE");

  const itemLink = (itm: Item): Maybe<Chunk> =>
    maybe.from(itm.ref).andThen((ref) => guide.get(gde, ref));

  return guide.getRoot(gde).map((rt) => root(rt));
}
