import { LitElement, html } from "lit";
import { Guide } from "./guide";
import { fetchGuide } from "./fetch-guide";
import { renderGuide, expandItem, State } from "./render-guide";
import { Maybe } from "./maybe";
import * as maybe from "./maybe";

customElements.define(
  "app-main",

  class AppMain extends LitElement {
    declare state: State;
    private declare _guide: Maybe<Guide>;

    static properties = {
      state: { type: Array },
      _guide: { state: true }
    };

    constructor() {
      super();
      this.state = [];
      this._guide = maybe.nothing();
      fetchGuide("guide.xml").then((guide) => {
        this._guide = maybe.just(guide);
        history.replaceState(this.state, "");
        addEventListener("popstate", (e) => {
          console.log("POPSTATE");
          this.state = e.state;
        });
        this.addEventListener("guide-click", (e) => {
          console.log(`CLICK: ${e.detail.path}`);
          this.state = expandItem(guide, e.detail.path, this.state);
          history.pushState(this.state, "");
        });
      });
    }

    protected createRenderRoot(): HTMLElement {
      return this;
    }

    render() {
      return [
        html`<p>STATE: ${JSON.stringify(this.state)}</p>`,
        this._guide
          .map((guide) => renderGuide(guide, this.state))
          .withDefault(html`<h1>GUIDE NOT LOADED</h1>`)
      ];
    }
  }
);

declare global {
  interface HTMLElementEventMap {
    "guide-click": CustomEvent;
  }
}
