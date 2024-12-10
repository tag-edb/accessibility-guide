import { html, HTMLTemplateResult, nothing } from "lit";
import * as maybe from "./maybe";
import { Guide, Chunk, Menu, Recipe, Item } from "./guide";
import * as guide from "./guide";
import { Path, State, MenuState, RecipeState, ItemState } from "./nav-guide";
import { classMap } from "lit/directives/class-map.js";

export function renderGuide(gde: Guide, state: State): HTMLTemplateResult {
  const chunk = (
    chnk: Chunk,
    state: State,
    live: boolean
  ): HTMLTemplateResult =>
    chnk.content.type === "menu"
      ? menu(chnk.title, chnk.content, state as MenuState, live)
      : recipe(chnk.content, state as RecipeState, live);

  const menu = (
    title: string,
    mnu: Menu,
    state: MenuState,
    live: boolean
  ): HTMLTemplateResult =>
    html`
      <div class="menu">
        <div
          class=${classMap({
            item: true,
            question: true,
            live: live && state.length === 0
          })}
        >
          <h2>${title}</h2>
        </div>
        <menu>
          ${mnu.items.map((itm, n) =>
            item(
              itm,
              state.length === 0 || state[0] !== n ? [] : state[1],
              live && (state.length === 0 || state[0] === n),
              n
            )
          )}
        </menu>
      </div>
    `;

  const recipe = (
    rcpe: Recipe,
    state: RecipeState,
    live: boolean
  ): HTMLTemplateResult =>
    state.length === 0
      ? recipe(rcpe, [[]], live)
      : html`
          <ol class="recipe">
            ${rcpe.items
              .slice(0, state.length)
              .map((itm, idx) =>
                item(itm, state[idx], live && idx === state.length - 1)
              )}
          </ol>
        `;

  const item = (
    itm: Item,
    state: ItemState,
    live: boolean,
    index?: number
  ): HTMLTemplateResult =>
    html`
      <li>
        <div class=${classMap({ item: true, live: live })}>
          <p>
            ${itm.text ??
            maybe
              .from(itm.ref)
              .andThen((ref) => guide.get(gde, ref))
              .map((chnk) => chnk.title)
              .withDefault("MISSING REFERENCE")}
          </p>
          ${live && state.length === 0
            ? [
                index !== undefined || itm.ref !== null
                  ? html` <button
                      @click=${(e: MouseEvent) =>
                        e.target?.dispatchEvent(
                          new CustomEvent("guide-expand", {
                            bubbles: true,
                            detail: { index: index }
                          })
                        )}
                    >
                      EXPAND
                    </button>`
                  : nothing,
                index === undefined
                  ? html`<button
                      @click=${(e: MouseEvent) =>
                        e.target?.dispatchEvent(
                          new CustomEvent("guide-next", {
                            bubbles: true
                          })
                        )}
                    >
                      NEXT
                    </button> `
                  : nothing
              ]
            : nothing}
        </div>
        ${state.length === 0
          ? nothing
          : maybe
              .from(itm.ref)
              .andThen((ref) => guide.get(gde, ref))
              .map((chnk) => chunk(chnk, state[0], live))
              .withDefault("MISSING REFERENCE")}
      </li>
    `;

  return guide
    .getRoot(gde)
    .map((chnk) => chunk(chnk, state, true))
    .withDefault(html`MISSING ROOT`);
}
