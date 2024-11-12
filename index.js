// @ts-ignore
import { html, render, nothing } from "lit";

/**
 * @param {string} url
 * @returns {Promise<XMLDocument>}
 */
async function getGuide(url) {
  const parser = new DOMParser();
  const response = await fetch(url);
  return parser.parseFromString(await response.text(), "text/xml");
}

/**
 * @param {XMLDocument} guide
 * @returns {void}
 */
function renderGuide(guide, path) {
  const root = guide.querySelector(`chunk#root`);
  renderChunk(root);
}

/**
 * @param {Element} chunk
 */
function renderChunk(chunk) {
  const title = chunk.querySelector("title");
  const menu = chunk.querySelector("menu");
  const recipe = chunk.querySelector("recipe");
  return html`
    <screen-body>
      ${title ? renderTitle(title) : nothing}
      ${menu ? renderMenu(menu) : recipe ? renderRecipe(recipe) : nothing}
    </screen-body>
  `;
}

/**
 * @param {Element} title
 */
function renderTitle(title) {
  return html` <screen-title>title.innerText</screen-title> `;
}

/**
 * @param {Element} menu
 */
function renderMenu(menu) {
  return html``;
}
