import { Maybe } from "./maybe";
import * as maybe from "./maybe";

type Id = string;

type Guide = Map<Id, Chunk>;

type Chunk = {
  id: Id;
  title: string;
  content: Content;
};

type Menu = {
  type: "menu";
  items: Item[];
};

type Recipe = {
  type: "recipe";
  items: Item[];
};

type Content = Menu | Recipe;

type Item = {
  ref: Id | null;
  text: string;
};

export async function fetchXML(url: string): Promise<XMLDocument> {
  const parser = new DOMParser();
  const response = await fetch(url);
  return parser.parseFromString(await response.text(), "text/xml");
}

export function guideFromXML(xml: XMLDocument): Maybe<Guide> {
  return Array.from(xml.querySelectorAll("chunk")).reduce(
    (maybeGuide, element) => {
      const maybeChunk = chunkFromXML(element);
      return maybeGuide.map2(maybeChunk, (guide, chunk) =>
        guide.set(chunk.id, chunk)
      );
    },
    maybe.from(new Map() as Guide)
  );
}

function chunkFromXML(xml: Element): Maybe<Chunk> {
  return maybe.all({
    id: maybe.from(xml.getAttribute("id")),
    title: maybe.from(xml.querySelector("title")?.textContent),
    content: maybe
      .from(xml.querySelector("menu"))
      .andThen((menu) =>
        maybe.all({
          type: maybe.just("menu" as "menu"),
          items: itemsFromXML(menu)
        })
      )
      .orElse(
        maybe.from(xml.querySelector("recipe")).andThen((recipe) =>
          maybe.all({
            type: maybe.just("recipe" as "recipe"),
            items: itemsFromXML(recipe)
          })
        )
      )
  });
}

function itemsFromXML(xml: Element): Maybe<Item[]> {
  return maybe.all(
    Array.from(xml.querySelectorAll("item")).map((item) =>
      maybe.all({
        ref: maybe.just(item.getAttribute("ref")),
        text: maybe.from(item.textContent)
      })
    )
  );
}
