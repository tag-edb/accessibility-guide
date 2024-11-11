import {
  LitElement,
  css,
  html,
  nothing
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";

customElements.define(
  "screen-body",

  class ScreenBody extends LitElement {
    static properties = {
      id: { type: String }
    };

    render() {
      return html`
        <section>
          <slot></slot>
          ${this.id ? html`<screen-backlink></screen-backlink>` : nothing}
        </section>
      `;
    }
  }
);

customElements.define(
  "screen-title",

  class ScreenTitle extends LitElement {
    render() {
      return html`
        <h2><slot></h2>
      `;
    }
  }
);

class ScreenMain extends LitElement {
  static styles = css`
    .main {
      display: flex;
      flex-wrap: wrap;
      flex: 0 0;
      margin: 0px;
      padding: 0px;
      gap: 20px;
    }
  `;
}

customElements.define(
  "screen-menu",

  class ScreenMenu extends ScreenMain {
    static styles = ScreenMain.styles;

    render() {
      return html`
        <p>Choose one of these</p>
        <menu class="main">
          <slot></slot>
        </menu>
      `;
    }
  }
);

customElements.define(
  "screen-recipe",

  class ScreenRecipe extends ScreenMain {
    static styles = [
      ScreenMain.styles,
      css`
        ol {
          counter-reset: step-count 0;
        }

        a::before {
          content: "hello";
        }
      `
    ];

    render() {
      return html`
        <p>Do these in order</p>
        <ol class="main">
          <slot></slot>
        </ol>
      `;
    }
  }
);

class ScreenItem extends LitElement {
  static styles = css`
    a.block-link {
      display: block;
      margin: 0px;
      padding: 10px;
      width: 200px;
      height: 200px;
      border: 5px solid black;
      border-radius: 10px;
      text-decoration: inherit;
      color: inherit;
    }
  `;
}

class MainItem extends ScreenItem {
  static properties = {
    href: { type: String },
    followed: { type: Boolean }
  };

  static styles = [
    ScreenItem.styles,
    css`
      li {
        display: block;
        margin: 0px;
        padding: 0px;
      }

      a.block-link.followed {
        border-color: darkgray;
        background-color: lightgray;
        color: darkgray;
      }
    `
  ];

  render() {
    const linkedHeading = this.href
      ? document.querySelector(`screen-body${this.href} > screen-title`)
      : null;
    return html`
      <li>
        <a
          class="block-link${this.followed ? " followed" : ""}"
          href="${this.href}"
        >
          <slot>${linkedHeading?.innerText}</slot>
        </a>
      </li>
    `;
  }
}

customElements.define(
  "menu-item",

  class MenuItem extends MainItem {}
);

customElements.define(
  "recipe-item",

  class RecipeItem extends MainItem {
    static styles = [
      MainItem.styles,
      css`
        a.block-link {
          counter-increment: step-count 1;
        }

        a.block-link::before {
          content: counter(step-count) ". ";
        }
      `
    ];
  }
);

customElements.define(
  "screen-backlink",

  class ScreenBacklink extends ScreenItem {
    render() {
      return html`
        <p>Then choose this when you've finished</p>
        <a class="block-link" href="javascript:history.back()">Go back</a>
      `;
    }
  }
);
