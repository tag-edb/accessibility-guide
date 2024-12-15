import { html, HTMLTemplateResult, nothing } from "lit";
import { Maybe } from "./maybe";
import * as maybe from "./maybe";
import { Guide, Chunk, Menu, Recipe, Item } from "./guide";
import * as guide from "./guide";
import {
  ChunkState,
  State,
  MenuState,
  RecipeState,
  ItemState
} from "./nav-guide";
import { classMap } from "lit/directives/class-map.js";

export function renderGuide(gde: Guide, state: State): HTMLTemplateResult {
  const root = (rt: Chunk): HTMLTemplateResult =>
    html`
      ${chunk(rt, state.state, true)}
      ${state.exhausted ? html`<h1>YOU'VE FINISHED!</h1>` : nothing}
    `;

  const chunk = (
    chnk: Chunk,
    chunkState: ChunkState,
    live: boolean
  ): HTMLTemplateResult =>
    chnk.content.type === "menu"
      ? menu(chnk.title, chnk.content, chunkState as MenuState, live)
      : recipe(chnk.content, chunkState as RecipeState, live);

  const menu = (
    title: string,
    mnu: Menu,
    menuState: MenuState,
    live: boolean
  ): HTMLTemplateResult =>
    html`
      <div class="menu">
        <div
          class=${classMap({
            item: true,
            question: true,
            live: live && menuState.length === 0
          })}
        >
          <div>${title}</div>
        </div>
        <menu>
          ${mnu.items.map((itm, n) =>
            option(
              itm,
              menuState.length === 0 || menuState[0] !== n ? [] : menuState[1],
              live && (menuState.length === 0 || menuState[0] === n),
              n
            )
          )}
        </menu>
      </div>
    `;

  const recipe = (
    rcpe: Recipe,
    recipeState: RecipeState,
    live: boolean
  ): HTMLTemplateResult =>
    recipeState.length === 0
      ? recipe(rcpe, [[]], live)
      : html`
          <ol class="recipe">
            ${rcpe.items
              .slice(0, recipeState.length)
              .map((itm, idx) =>
                step(
                  itm,
                  recipeState[idx],
                  live && idx === recipeState.length - 1
                )
              )}
          </ol>
        `;

  const step = (
    itm: Item,
    itemState: ItemState,
    live: boolean
  ): HTMLTemplateResult =>
    html`
      <li>
        <div class="item step live">
          <p>
            ${itemText(itm)}
            ${!state.exhausted && live && itemState.length === 0
              ? [
                  itm.ref !== null
                    ? choiceButton("HOW DO I DO THAT?", "guide-expand")
                    : nothing,
                  choiceButton("OKAY, WHAT'S NEXT", "guide-next")
                ]
              : nothing}
          </p>
        </div>
        ${itemState.length === 0
          ? nothing
          : itemLink(itm)
              .map((chnk) => chunk(chnk, itemState[0], live))
              .withDefault("MISSING REFERENCE")}
      </li>
    `;

  const option = (
    itm: Item,
    itemState: ItemState,
    live: boolean,
    index: number
  ): HTMLTemplateResult =>
    html`
      <li>
        <div class=${classMap({ item: true, option: true, live: live })}>
          <p>
            ${itemText(itm)}
            ${!state.exhausted && live && itemState.length === 0
              ? choiceButton("CHOOSE THIS", "guide-expand", { index: index })
              : nothing}
          </p>
        </div>
        ${itemState.length === 0
          ? nothing
          : itemLink(itm)
              .map((chnk) => chunk(chnk, itemState[0], live))
              .withDefault("MISSING REFERENCE")}
      </li>
    `;

  const choiceButton = (
    text: string,
    eventType: string,
    eventDetail?: any
  ): HTMLTemplateResult =>
    html`
      <button
        @click=${(e: MouseEvent) =>
          e.target?.dispatchEvent(
            new CustomEvent(eventType, {
              bubbles: true,
              detail: eventDetail
            })
          )}
      >
        ${text}
      </button>
    `;

  const itemText = (itm: Item): string =>
    itm.text ??
    itemLink(itm)
      .map((chnk) => chnk.title)
      .withDefault("MISSING REFERENCE");

  const itemLink = (itm: Item): Maybe<Chunk> =>
    maybe.from(itm.ref).andThen((ref) => guide.get(gde, ref));

  return guide
    .getRoot(gde)
    .map((rt) => root(rt))
    .withDefault(html`MISSING ROOT`);
}
