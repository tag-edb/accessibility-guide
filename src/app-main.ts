import { LitElement, html } from "lit";
import { Guide } from "./guide";
import { fetchGuide } from "./fetch-guide";
import { State, expandItem, nextItem } from "./nav-guide";
import { renderGuide } from "./render-guide";
import { Maybe } from "./maybe";
import * as maybe from "./maybe";

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
      this._state = [];
      fetchGuide("guide-ai.xml").then((guide) => {
        this._guide = maybe.just(guide);
        history.replaceState(this._state, "");
        addEventListener("popstate", (e) => {
          this._state = e.state;
        });
        this.addEventListener("guide-expand", (e) => {
          this._state = expandItem(guide, this._state, e.detail.index);
          history.pushState(this._state, "");
        });
        this.addEventListener("guide-next", () => {
          this._state = nextItem(guide, this._state);
        });
      });
    }

    protected createRenderRoot(): HTMLElement {
      return this;
    }

    render() {
      return this._guide
        .map((guide) => renderGuide(guide, this._state))
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
