import { html, HTMLTemplateResult, nothing } from "lit";
import * as maybe from "./maybe";
import { Guide, Chunk, Menu, Recipe, Item } from "./guide";
import * as guide from "./guide";
import { Path, State, MenuState, RecipeState, ItemState } from "./nav-guide";
import { classMap } from "lit/directives/class-map.js";

export function renderGuide(gde: Guide, state: State): HTMLTemplateResult {
  const chunk = (path: Path, chnk: Chunk, state: State): HTMLTemplateResult =>
    chnk.content.type === "menu"
      ? menu(path, chnk.title, chnk.content, state as MenuState)
      : recipe(path, chnk.content, state as RecipeState);

  const menu = (path: Path, title: string, mnu: Menu, state: MenuState) => html`
    <div>
      <h2 class=${classMap({ live: state.length === 0 })}>${title}</h2>
      <menu>
        ${state.length === 0
          ? html`
              ${mnu.items.map((itm, n) => item([...path, n], itm, [], true, n))}
            `
          : item([...path, state[0]], mnu.items[state[0]], state[1], false)}
      </menu>
    </div>
  `;

  const recipe = (path: Path, rcpe: Recipe, state: RecipeState) => html`
    <ol>
      ${state.length === 0
        ? item([...path, 0], rcpe.items[0], [], true)
        : rcpe.items
            .slice(0, state.length)
            .map((itm, idx) =>
              item([...path, idx], itm, state[idx], idx === state.length - 1)
            )}
    </ol>
  `;

  const item = (
    path: Path,
    itm: Item,
    state: ItemState,
    isLive: boolean,
    index?: number
  ) => html`
    <li class=${classMap({ live: isLive && state.length === 0 })}>
      <p>
        ${JSON.stringify(path)}: ${itm.text} -> ${itm.ref}
        ${isLive && state.length === 0
          ? [
              index !== undefined || itm.ref !== undefined
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
      </p>
      ${state.length === 0
        ? nothing
        : maybe
            .from(itm.ref)
            .andThen((ref) => guide.get(gde, ref))
            .map((ref) => chunk(path, ref, state[0]))
            .withDefault("MISSING REFERENCE")}
    </li>
  `;

  return guide
    .getRoot(gde)
    .map((chnk) => chunk([], chnk, state))
    .withDefault(html`MISSING ROOT`);
}
