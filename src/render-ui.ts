import { html, HTMLTemplateResult, nothing } from "lit";
import {
  GuideUI,
  ChunkUI,
  MenuUI,
  RecipeUI,
  StepUI,
  ChoiceUI
} from "./create-ui";
import { ClassInfo, classMap } from "lit/directives/class-map.js";

export function renderUI(gde: GuideUI): HTMLTemplateResult {
  return html`
    ${chunk(gde.root)}
    ${gde.coda.map((coda) => html`<h1>${coda}</h1>`).withDefault(nothing)}
  `;
}

const chunk = (chnk: ChunkUI): HTMLTemplateResult =>
  chnk.type === "menu" ? menu(chnk) : recipe(chnk);

const menu = (mnu: MenuUI): HTMLTemplateResult =>
  choiceList({ menu: true }, mnu.current, mnu.title, mnu.choices);

const recipe = (rcpe: RecipeUI): HTMLTemplateResult =>
  html`
    <ol class="recipe">
      ${rcpe.steps.map((stp) => step(stp))}
    </ol>
  `;

const step = (stp: StepUI): HTMLTemplateResult =>
  html`
    <li class="step">
      ${choiceList({ step: true }, stp.current, stp.text, [
        ...stp.expand.map((chc) => [chc]).withDefault([]),
        stp.next
      ])}
    </li>
  `;

const choiceList = (
  classes: ClassInfo,
  current: boolean,
  title: string,
  choices: ChoiceUI[]
): HTMLTemplateResult =>
  html`
    <div class=${classMap({ ...classes, current: current, choicelist: true })}>
      ${item({ title: true }, html`<p>${title}</p>`)}
      <menu>
        ${choices.map(
          (chc) =>
            html`
              <li class=${classMap({ selected: chc.children.length > 0 })}>
                ${item(
                  {},
                  choiceButton(
                    chc.text,
                    !current,
                    chc.event.type,
                    chc.event.detail
                  )
                )}
                ${chc.children.map((chnk) => chunk(chnk))}
              </li>
            `
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
