import { LitElement, html } from "lit";
import { Guide } from "./guide";
import { fetchGuide } from "./fetch-guide";
import { State, expandItem, nextItem } from "../../nav-guide";
import { renderUI } from "./render-ui";
import { Maybe } from "../../maybe";
import * as maybe from "../../maybe";
import { createUI } from "./create-ui";
import { styles } from "./styles";
import { customElement, state } from "lit/decorators.js";

@customElement("app-main")
export class AppMain extends LitElement {
  static styles = styles;

  @state()
  private _guide: Maybe<Guide>;
  @state()
  private _state: State;

  constructor() {
    super();
    this._guide = maybe.nothing();
    this._state = { state: [], exhausted: false };
    fetchGuide("guide-claude.xml")
      .then((guide) => {
        this._guide = maybe.just(guide);
        history.replaceState(this._state, "");
        addEventListener("popstate", (e) => {
          this._state = e.state;
          ``;
        });
      })
      .catch((e) => console.log(`Guide fetch error: ${e}`));
  }

  render() {
    const guideExpand = (index: number) => {
      this._guide.map((guide) => {
        this._state = expandItem(guide, this._state, index);
        history.pushState(this._state, "");
      });
    };

    const guideNext = () => {
      this._guide.map((guide) => {
        this._state = nextItem(guide, this._state);
        history.pushState(this._state, "");
      });
    };

    return this._guide
      .andThen((guide) => createUI(guide, this._state))
      .map((ui) => {
        console.log(ui);
        return ui;
      })
      .map((guideUI) => renderUI(guideUI, guideExpand, guideNext))
      .withDefault(html`<h1>GUIDE NOT LOADED</h1>`);
  }
}
