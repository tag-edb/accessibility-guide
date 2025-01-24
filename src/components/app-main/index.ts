import { LitElement, html } from "lit";
import { Guide } from "./guide";
import { fetchGuide } from "./fetch-guide";
import { State, expandItem, nextItem } from "../../nav-guide";
import { renderUI } from "./render-ui";
import { Maybe } from "../../maybe";
import * as maybe from "../../maybe";
import { createUI } from "./create-ui";
import { styles } from "./styles";

customElements.define(
  "app-main",

  class AppMain extends LitElement {
    static styles = styles;

    declare private _guide: Maybe<Guide>;
    declare private _state: State;

    static properties = {
      _guide: { state: true },
      _state: { state: true },
    };

    constructor() {
      super();
      this._guide = maybe.nothing();
      this._state = { state: [], exhausted: false };
      fetchGuide("guide-claude.xml").then((guide) => {
        this._guide = maybe.just(guide);
        history.replaceState(this._state, "");
        addEventListener("popstate", (e) => {
          this._state = e.state;
        });
      });
    }

    private _guideExpand = (index: number) => {
      this._guide.map((guide) => {
        this._state = expandItem(guide, this._state, index);
        history.pushState(this._state, "");
      });
    };

    private _guideNext = () => {
      this._guide.map((guide) => {
        this._state = nextItem(guide, this._state);
        history.pushState(this._state, "");
      });
    };

    render() {
      return this._guide
        .andThen((guide) => createUI(guide, this._state))
        .map((ui) => {
          console.log(ui);
          return ui;
        })
        .map((guideUI) => renderUI(guideUI, this._guideExpand, this._guideNext))
        .withDefault(html`<h1>GUIDE NOT LOADED</h1>`);
    }
  },
);
