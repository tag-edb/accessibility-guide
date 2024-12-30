import { LitElement, html } from "lit";
import { Guide } from "./guide";
import { fetchGuide } from "./fetch-guide";
import { State, expandItem, nextItem } from "./nav-guide";
import { renderUI } from "./render-ui";
import { Maybe } from "./maybe";
import * as maybe from "./maybe";
import { createUI } from "./create-ui";

customElements.define(
  "app-main",

  class AppMain extends LitElement {
    private declare _guide: Maybe<Guide>;
    private declare _state: State;

    static properties = {
      _guide: { state: true },
      _state: { state: true }
    };

    constructor() {
      super();
      this._guide = maybe.nothing();
      this._state = { state: [], exhausted: false };
      fetchGuide("guide-ai.xml").then((guide) => {
        this._guide = maybe.just(guide);
        history.replaceState(this._state, "");
        addEventListener("popstate", (e) => {
          this._state = e.state;
        });
        this.addEventListener("guide-expand", (e) => {
          this._state = expandItem(guide, this._state, e.detail?.index);
          history.pushState(this._state, "");
        });
        this.addEventListener("guide-next", () => {
          this._state = nextItem(guide, this._state);
          history.pushState(this._state, "");
        });
      });
    }

    protected createRenderRoot(): HTMLElement {
      return this;
    }

    render() {
      this._guide.map((guide) => console.log(createUI(guide, this._state)));
      return this._guide
        .andThen((guide) => createUI(guide, this._state))
        .map((guideUI) => renderUI(guideUI))
        .withDefault(html`<h1>GUIDE NOT LOADED</h1>`);
    }
  }
);

declare global {
  interface HTMLElementEventMap {
    "guide-expand": CustomEvent;
    "guide-next": CustomEvent;
  }
}
