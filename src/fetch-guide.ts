import { Maybe } from "./maybe";
import * as maybe from "./maybe";
import { Guide, Chunk, Item } from "./guide";

export async function fetchGuide(url: string): Promise<Guide> {
  return fetchXML(url).then((xml) => guideFromXML(xml).toPromise());
}

async function fetchXML(url: string): Promise<XMLDocument> {
  const parser = new DOMParser();
  const response = await fetch(url);
  return parser.parseFromString(await response.text(), "text/xml");
}

function guideFromXML(xml: XMLDocument): Maybe<Guide> {
  return Array.from(xml.querySelectorAll("menu,recipe")).reduce(
    (maybeGuide, element) => {
      const maybeChunk: Maybe<Chunk> =
        element.tagName === "menu"
          ? menuFromXML(element)
          : element.tagName === "recipe"
          ? recipeFromXML(element)
          : maybe.nothing();
      return maybeGuide.map2(maybeChunk, (guide, chunk) =>
        guide.set(chunk.id, chunk)
      );
    },
    maybe.from(new Map() as Guide)
  );
}

function menuFromXML(xml: Element): Maybe<Chunk> {
  return maybe.all({
    id: maybe.from(xml.getAttribute("id")),
    title: maybe.from(xml.querySelector("prompt")?.textContent),
    content: maybe.all({
      type: maybe.just("menu" as "menu"),
      items: itemsFromXMLs([...xml.querySelectorAll("choice")])
    })
  });
}

function recipeFromXML(xml: Element): Maybe<Chunk> {
  return maybe.all({
    id: maybe.from(xml.getAttribute("id")),
    title: maybe.from(xml.querySelector("summary")?.textContent),
    content: maybe.all({
      type: maybe.just("recipe" as "recipe"),
      items: itemsFromXMLs([...xml.querySelectorAll("step")])
    })
  });
}

function itemsFromXMLs(xmls: Element[]): Maybe<Item[]> {
  return maybe.all(
    xmls.map((item) =>
      maybe.all({
        ref: maybe.just(item.getAttribute("ref")),
        text: maybe
          .from(item.textContent?.trim())
          .map((text) => (text.length === 0 ? null : text))
      })
    )
  );
}
