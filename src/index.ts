import { Maybe } from "./maybe";
import * as maybe from "./maybe";

type Id = string;

type Guide = Map<Id, Chunk>;

type Chunk = {
  id: Id;
  title: string;
  //content: Menu | Recipe;
};

type Menu = {
  type: "menu";
  items: [Item];
};

type Recipe = {
  type: "recipe";
  items: [Item];
};

type Item = {
  ref: Id;
  text: string;
};

async function fetchXML(url: string): Promise<XMLDocument> {
  const parser = new DOMParser();
  const response = await fetch(url);
  return parser.parseFromString(await response.text(), "text/xml");
}

function guideFromXML(xml: XMLDocument): Maybe<Guide> {
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
    title: maybe.from(xml.querySelector("title")?.innerText)
    //content: contentFromXML(xml)
  });
}

/*
function contentFromXML(xml: Element): Maybe<Menu | Recipe> {
  return maybe.all({
    type: maybe
      .from(xml.querySelector("menu"))
      .map(() => "menu" as "menu"),
    items: maybe.all(Array.from(xml.querySelectorAll)
  });
}

function itemsFromXML(xml: Element): Maybe<[Item]> {
  return Array.from(xml.querySelectorAll('item')).map
}
*/
