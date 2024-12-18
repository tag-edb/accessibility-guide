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
import { ClassInfo, classMap } from "lit/directives/class-map.js";

export function renderGuide(gde: Guide, state: State): HTMLTemplateResult {
  const root = (rt: Chunk): HTMLTemplateResult =>
    html`
      ${chunk(rt, state.state, true, !state.exhausted)}
      ${state.exhausted ? html`<h1>YOU'VE FINISHED!</h1>` : nothing}
    `;

  const chunk = (
    chnk: Chunk,
    chunkState: ChunkState,
    live: boolean,
    current: boolean
  ): HTMLTemplateResult =>
    chnk.content.type === "menu"
      ? menu(chnk.title, chnk.content, chunkState as MenuState, live, current)
      : recipe(chnk.content, chunkState as RecipeState, live, current);

  const menu = (
    title: string,
    mnu: Menu,
    menuState: MenuState,
    live: boolean,
    current: boolean
  ): HTMLTemplateResult =>
    html`
      <div
        class=${classMap({
          menu: true,
          live: live,
          current: current && menuState.length === 0
        })}
      >
        ${item(
          {
            question: true,
            live: live
          },
          html`${title}`
        )}
        <menu>
          ${mnu.items.map((itm, n) =>
            option(
              itm,
              menuState.length === 0 || menuState[0] !== n ? [] : menuState[1],
              live && (menuState.length === 0 || menuState[0] === n),
              current && (menuState.length === 0 || menuState[0] === n),
              { index: n }
            )
          )}
        </menu>
      </div>
    `;

  const recipe = (
    rcpe: Recipe,
    recipeState: RecipeState,
    live: boolean,
    current: boolean
  ): HTMLTemplateResult =>
    recipeState.length === 0
      ? recipe(rcpe, [[]], live, current)
      : html`
          <ol
            class=${classMap({
              recipe: true,
              live: live
            })}
          >
            ${rcpe.items
              .slice(0, recipeState.length)
              .map((itm, idx) =>
                step(
                  itm,
                  recipeState[idx],
                  live,
                  current && idx === recipeState.length - 1
                )
              )}
          </ol>
        `;

  const step = (
    itm: Item,
    itemState: ItemState,
    live: boolean,
    current: boolean
  ): HTMLTemplateResult =>
    html`
      <li>
        ${menu(
          itemText(itm),
          {
            type: "menu",
            items: ([] as Item[])
              .concat(
                itm.ref !== null
                  ? [{ ref: itm.ref, text: "HOW DO I DO THAT?" }]
                  : []
              )
              .concat([{ ref: null, text: "OKAY, WHAT'S NEXT?" }])
          },
          itemState.length === 0 ? [] : [0, itemState],
          live,
          current
        )}
      </li>
    `;

  const option = (
    itm: Item,
    itemState: ItemState,
    live: boolean,
    current: boolean,
    eventDetail?: any
  ): HTMLTemplateResult =>
    html`
      <li>
        ${item(
          { option: true, live: live },
          html`
            ${itemText(itm)}
            ${current && itemState.length === 0
              ? choiceButton(
                  "CHOOSE THIS",
                  itm.ref !== null ? "guide-expand" : "guide-next",
                  eventDetail
                )
              : nothing}
          `
        )}
        ${itemState.length === 0
          ? nothing
          : itemLink(itm)
              .map((chnk) => chunk(chnk, itemState[0], live, current))
              .withDefault("MISSING REFERENCE")}
      </li>
    `;

  const item = (
    classes: ClassInfo,
    content: HTMLTemplateResult
  ): HTMLTemplateResult =>
    html`
      <div class=${classMap({ ...classes, item: true })}>
        <p>${content}</p>
      </div>
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
