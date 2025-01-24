import { html, HTMLTemplateResult, nothing } from "lit";
import {
  GuideUI,
  ChunkUI,
  MenuUI,
  RecipeUI,
  StepUI,
  ChoiceUI,
} from "./create-ui";
import { ClassInfo, classMap } from "lit/directives/class-map.js";

export function renderUI(
  gde: GuideUI,
  guideExpand: (index: number) => void,
  guideNext: () => void,
): HTMLTemplateResult {
  const chunk = (chnk: ChunkUI): HTMLTemplateResult =>
    chnk.type === "menu" ? menu(chnk) : recipe(chnk);

  const menu = (mnu: MenuUI): HTMLTemplateResult =>
    choiceList(
      { menu: true },
      mnu.current,
      mnu.title,
      mnu.choices.map((chc, idx) => ({
        classes: { option: true },
        ui: chc,
        onClick: () => guideExpand(idx),
      })),
    );

  const recipe = (rcpe: RecipeUI): HTMLTemplateResult => html`
    <ol class="recipe">
      ${rcpe.steps.map((stp) => step(stp))}
    </ol>
  `;

  const step = (stp: StepUI): HTMLTemplateResult => html`
    <li
      class=${classMap({
        step: true,
        expanded: stp.expand
          .map((chc) => chc.children.length > 0)
          .withDefault(false),
      })}
    >
      ${choiceList({ step: true }, stp.current, stp.text, [
        ...stp.expand
          .map((chc) => [
            {
              classes: { expand: true },
              ui: chc,
              onClick: () => guideExpand(0),
            },
          ])
          .withDefault([]),
        { classes: { next: true }, ui: stp.next, onClick: guideNext },
      ])}
    </li>
  `;

  const choiceList = (
    classes: ClassInfo,
    current: boolean,
    title: string,
    choices: { classes: ClassInfo; ui: ChoiceUI; onClick: () => void }[],
  ): HTMLTemplateResult => html`
    <div class=${classMap({ ...classes, current: current, choicelist: true })}>
      ${item({ title: true }, html`<p>${title}</p>`)}
      <menu>
        ${choices.map(
          (chc) => html`
            <li class=${classMap({ selected: chc.ui.children.length > 0 })}>
              ${item(
                chc.classes,
                choiceButton(chc.ui.text, !current, chc.onClick),
              )}
              ${chc.ui.children.map((chnk) => chunk(chnk))}
            </li>
          `,
        )}
      </menu>
    </div>
  `;

  const item = (
    classes: ClassInfo,
    content: HTMLTemplateResult,
  ): HTMLTemplateResult => html`
    <div class=${classMap({ ...classes, item: true })}>${content}</div>
  `;

  const choiceButton = (
    text: string,
    disabled: boolean,
    onClick: () => void,
  ): HTMLTemplateResult => html`
    <button type="button" ?disabled=${disabled} @click=${() => onClick()}>
      ${text}
    </button>
  `;

  return html`
    <div class="wrap">
      <div class="content">
        ${chunk(gde.root)}
        ${gde.coda.map((coda) => html`<h1>${coda}</h1>`).withDefault(nothing)}
      </div>
    </div>
  `;
}
