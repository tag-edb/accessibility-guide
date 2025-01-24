import { css } from "lit";

export const styles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    --item-width: 100%;
    --item-height: 100px;
    --item-margin: 10px;
    --icon-width: 85px;
    --icon-size: 30px;
    --icon-spacing: 0px;
    --border-width: 5px;
    --border-radius: 10px;
    --animation-unit: 0.5s;
    display: flex;
    flex-direction: column;
    flex: auto 1 1;
    overflow: hidden;
    background: lightgray;
    container-type: inline-size;
    interpolate-size: allow-keywords;
  }

  .wrap {
    display: flex;
    flex-direction: column-reverse;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .content,
  .choicelist,
  menu,
  ol,
  li,
  h1 {
    width: 100%;
    display: block;
    height: auto;
    flex-direction: column;
    align-items: center;
    flex: 0 0;
    margin: 0px;
    padding: 0px;
    border: none;
  }

  .choicelist {
    position: relative;
  }

  .choicelist::before {
    content: "";
    display: block;
    position: absolute;
    top: 10px;
    left: 10px;
    bottom: 10px;
    right: 10px;
    background-color: lightgray;
    transition: background-color var(--animation-unit);
  }

  .choicelist.current::before {
    box-shadow: 0px 0px 5px 5px yellow;
    background-color: white;
  }

  .choicelist > * {
    position: relative;
  }

  button {
    appearance: none;
    font: inherit;
    color: inherit;
    text-align: inherit;
  }

  .item {
    flex: 0 0 auto;
    width: var(--item-width);
    opacity: 1;
    overflow: hidden;
    margin: 0px;
    padding: 0px;
    display: flex;
    flex-direction: row;
  }

  .item > * {
    display: flex;
    margin: var(--item-margin);
    padding: 10px;
    flex: 1 0 calc(100cqw - 3 * var(--item-margin) - var(--icon-width));
    min-height: calc(var(--item-height) - 2 * var(--item-margin));
    border: var(--border-width) solid darkgray;
    border-radius: var(--border-radius);
    background-color: white;
    color: gray;
    font-size: larger;
    font-weight: bold;
  }

  .current .item > * {
    color: black;
    border-color: black;
  }

  .current .item > button:enabled {
    background-color: #c1f1c1;
  }

  .current .item > button:focus {
    border-color: royalblue;
  }

  .item {
    animation:
      var(--animation-unit) var(--animation-unit) backwards grow,
      var(--animation-unit) calc(2 * var(--animation-unit)) backwards fade-in;
  }

  .content > .menu > .title,
  .content > .menu > menu > li > .item {
    animation: none;
  }

  .menu:not(.current) > .title,
  .menu:not(.current) > menu > li:not(.selected) > .item,
  .recipe > li > .choicelist:not(.current) > menu > li > .item {
    animation:
      var(--animation-unit) forwards fade-out,
      var(--animation-unit) var(--animation-unit) forwards shrink;
  }

  .item::before {
    margin-left: var(--item-margin);
    flex: 0 0 var(--icon-width);
    height: calc(var(--item-height) - 2 * var(--item-margin));
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: var(--icon-size);
    letter-spacing: var(--icon-spacing);
    text-align: center;
    content: "🙂👇";
  }

  .menu > .title::before {
    content: "🤔";
  }

  .step.current > .title::before,
  .step:not(.expanded) > .choicelist > .title::before {
    content: "😀👉";
  }

  menu > li:not(.selected) > .item.option::before {
    content: "💭";
  }

  .step > menu > li > .item.expand::before {
    content: "❓";
  }

  .step > menu > li > .item.next::before {
    content: "✔️";
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes shrink {
    to {
      width: 0px;
      height: 0px;
      display: none;
    }
  }

  @keyframes grow {
    from {
      display: none;
      width: 0px;
      height: 0px;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
`;
