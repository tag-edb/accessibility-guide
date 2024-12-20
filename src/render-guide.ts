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
    choiceList(
      {
        menu: true,
        live: live,
        current: current && menuState.length === 0
      },
      title,
      mnu.items.map((itm, idx) =>
        menuItem(
          itm,
          menuState.length === 0 || menuState[0] !== idx ? [] : menuState[1],
          live && (menuState.length === 0 || menuState[0] === idx),
          current && (menuState.length === 0 || menuState[0] === idx),
          idx
        )
      )
    );

  const menuItem = (
    itm: Item,
    itemState: ItemState,
    live: boolean,
    current: boolean,
    idx: number
  ): ChoiceItem => ({
    classes: { dismissed: !current },
    text: itemText(itm),
    disabled: !(current && itemState.length === 0),
    event: { type: "guide-expand", detail: { index: idx } },
    children: html`${itemState.length === 0
      ? nothing
      : itemLink(itm)
          .map((chnk) => chunk(chnk, itemState[0], live, current))
          .withDefault("MISSING REFERENCE")}`
  });

  const recipe = (
    rcpe: Recipe,
    recipeState: RecipeState,
    live: boolean,
    current: boolean
  ): HTMLTemplateResult =>
    recipeState.length === 0
      ? recipe(rcpe, [[]], live, current)
      : html`
          <ol class="recipe">
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
      <li class="step">
        ${choiceList(
          { current: current },
          itemText(itm),
          ([] as ChoiceItem[])
            .concat(
              itm.ref !== null
                ? [
                    {
                      classes: {},
                      text: "HOW DO I DO THAT?",
                      disabled: !(current && itemState.length === 0),
                      event: { type: "guide-expand", detail: { index: 0 } },
                      children: html`${itemState.length === 0
                        ? nothing
                        : itemLink(itm)
                            .map((chnk) =>
                              chunk(chnk, itemState[0], live, current)
                            )
                            .withDefault("MISSING REFERENCE")}`
                    }
                  ]
                : []
            )
            .concat([
              {
                classes: {},
                text: "OKAY, WHAT'S NEXT?",
                disabled: !(current && itemState.length === 0),
                event: { type: "guide-next", detail: {} },
                children: html``
              }
            ])
        )}
      </li>
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

type ChoiceItem = {
  classes: ClassInfo;
  text: string;
  disabled: boolean;
  event: { type: string; detail: any };
  children: HTMLTemplateResult;
};

const choiceList = (
  classes: ClassInfo,
  title: string,
  items: ChoiceItem[]
): HTMLTemplateResult =>
  html`
    <div class=${classMap({ ...classes, choicelist: true })}>
      ${item({ title: true }, html`<p>${title}</p>`)}
      <menu>
        ${items.map(
          (itm) =>
            html`<li>
              ${item(
                itm.classes,
                choiceButton(
                  itm.text,
                  itm.disabled,
                  itm.event.type,
                  itm.event.detail
                )
              )}
              ${itm.children}
            </li>`
        )}
      </menu>
    </div>
  `;

const item = (
  classes: ClassInfo,
  content: HTMLTemplateResult
): HTMLTemplateResult =>
  html` <div class=${classMap({ ...classes, item: true })}>${content}</div> `;

const choiceButton = (
  text: string,
  disabled: boolean,
  eventType: string,
  eventDetail?: any
): HTMLTemplateResult =>
  html`
    <button
      ?disabled=${disabled}
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
