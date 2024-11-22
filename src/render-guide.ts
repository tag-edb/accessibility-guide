import { html, HTMLTemplateResult, nothing } from "lit";
import * as maybe from "./maybe";
import { Guide, Chunk, Item } from "./guide";
import * as guide from "./guide";

type Path = number[];

export type State = MenuState | RecipeState;
type MenuState = [] | [number, ItemState];
type RecipeState = [] | ItemState[];
type ItemState = [] | [State];

export function expandItem(gde: Guide, path: Path, state: State): State {
  const chunk = (path: Path, chnk: Chunk, state: State): State =>
    chnk.content.type === "menu"
      ? menu(path, chnk.content.items, state as MenuState)
      : chnk.content.type === "recipe"
      ? recipe(path, chnk.content.items, state as RecipeState)
      : state;

  const menu = (path: Path, itms: Item[], state: MenuState): MenuState =>
    path.length === 0
      ? state
      : [
          path[0],
          item(path.slice(1), itms[path[0]], state.length === 0 ? [] : state[1])
        ];

  const recipe = (path: Path, itms: Item[], state: RecipeState): RecipeState =>
    path.length === 0
      ? state
      : state.length <= path[0]
      ? recipe(path, itms, [
          ...state,
          ...Array(path[0] + 1 - state.length).fill([])
        ])
      : state.toSpliced(
          path[0],
          1,
          item(path.slice(1), itms[path[0]], state[path[0]])
        );

  const item = (path: Path, itm: Item, state: ItemState): ItemState =>
    maybe
      .from(itm.ref)
      .andThen((ref) => guide.get(gde, ref))
      .map<ItemState>((chnk) => [
        chunk(path, chnk, state.length === 0 ? [] : state[0])
      ])
      .withDefault(state);

  return guide
    .getRoot(gde)
    .map((chnk) => chunk(path, chnk, state))
    .withDefault(state);
}

export function renderGuide(gde: Guide, state: State): HTMLTemplateResult {
  const chunk = (path: Path, chnk: Chunk, state: State): HTMLTemplateResult =>
    chnk.content.type === "menu"
      ? menu(path, chnk.title, chnk.content.items, state as MenuState)
      : chnk.content.type === "recipe"
      ? recipe(path, chnk.content.items, state as RecipeState)
      : html`BAD CHUNK CONTENT`;

  const menu = (
    path: Path,
    title: string,
    itms: Item[],
    state: MenuState
  ) => html`
    <div>
      ${state.length === 0
        ? html`
            <h2>${title}</h2>
            <menu>${itms.map((itm, n) => item([...path, n], itm, []))}</menu>
          `
        : item([...path, state[0]], itms[state[0]], state[1])}
    </div>
  `;

  const recipe = (path: Path, itms: Item[], state: RecipeState) => html`
    <ol>
      ${state.length === 0
        ? item([...path, 0], itms[0], [])
        : itms
            .slice(0, state.length)
            .map((itm, n) => item([...path, n], itm, state[n]))}
    </ol>
  `;

  const item = (path: Path, itm: Item, state: ItemState) => html`
    <li
      @click=${(e: MouseEvent) =>
        e.target?.dispatchEvent(
          new CustomEvent("guide-click", {
            bubbles: true,
            detail: { path: path }
          })
        )}
    >
      <p>${JSON.stringify(path)}: ${itm.text} -> ${itm.ref}</p>
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

/*
customElements.define("guide-chunk", GuideChunk);
declare global {
  interface HTMLELementTagNameMap {
    "guide-chunk": GuideChunk;
  }
}

class GuideContent extends GuideElement {
  declare source: Content;

  static properties = {
    ...super.properties,
    source: { attribute: false }
  };
}

export class GuideMenu extends GuideContent {
  #renderItem(n: number, item: Item, state: State) {
    return html`<guide-item
      .guide=${this.guide}
      .source=${item}
      .path=${[...this.path, n]}
      .state=${state}
    ></guide-item>`;
  }

  render() {
    const [selection, childState] =
      this.state instanceof Array ? this.state : [undefined, undefined];
    return this.state instancef Array && this.
      ? html`
          <p>Choose one of these</p>
          ${[...this.source.items.entries()].map(([idx, item]) =>
            this.#renderItem(idx, item, [0, []])
          )}
        `
      : selection < this.source.items.length
      ? this.#renderItem(selection, this.source.items[selection], childState as State)
      : html`INVALID STATE`;
  }
}

customElements.define("guide-menu", GuideMenu);
declare global {
  interface HTMLELementTagNameMap {
    "guide-menu": GuideMenu;
  }
}

class GuideItem extends GuideElement {
  declare source: Item;

  static properties = {
    ...super.properties,
    source: { attribute: false }
  };

  render() {
    const [selection, childStates] = this.state;
    return selection === 0
      ? html`<p>${this.source.text}</p>`
      : selection === 1 && this.source.ref !== null
      ? html` <guide-chunk
          .guide=${this.guide}
          .path=${this.path}
          .state=${childStates[0]}
          .chunkId=${this.source.ref}
        ></guide-chunk>`
      : html`INVALID STATE`;
  }
}

customElements.define("guide-item", GuideItem);
declare global {
  interface HTMLELementTagNameMap {
    "guide-item": GuideItem;
  }
}
*/
