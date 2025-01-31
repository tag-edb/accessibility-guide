import { Result } from "../../result";
import * as result from "../../result";
import { Guide, Chunk, Item } from "./guide";

export async function fetchGuide(url: string): Promise<Guide> {
  return fetchXML(url).then((xml) =>
    guideFromXML(xml)
      .toPromise()
      .catch((e) => {
        console.log(
          `Error parsing guide: ${e.message}\nParent element:\n${e.element.outerHTML}`
        );
        throw e;
      })
  );
}

async function fetchXML(url: string): Promise<XMLDocument> {
  const parser = new DOMParser();
  const response = await fetch(url);
  return parser.parseFromString(await response.text(), "text/xml");
}

class GuideError extends Error {
  element: Element | null;

  constructor(message: string, element: Element | null) {
    super(message);
    // See https://github.com/microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, GuideError.prototype);
    this.element = element;
  }
}

function guideFromXML(xml: XMLDocument): Result<GuideError, Guide> {
  return result
    .ok<GuideError, Element>(xml.documentElement)
    .andThen(checkTag("guide"))
    .andThen((guide) =>
      Array.from(guide.children).reduce<Result<GuideError, Guide>>(
        (resultGuide, element) =>
          resultGuide.map2(
            result.ok(element).oneOf([menuFromXML, recipeFromXML]),
            (guide, chunk) => guide.set(chunk.id, chunk)
          ),
        result.ok(new Map())
      )
    );
}

function menuFromXML(xml: Element): Result<GuideError, Chunk> {
  return checkTag("menu")(xml).andThen((xml) =>
    result.all({
      id: attr("id")(xml),
      content: result.all({
        type: result.ok("menu" as "menu"),
        title: child("prompt")(xml).map((prompt) => prompt.textContent ?? ""),
        items: children("choice")(xml).andThen((choices) =>
          result.all(choices.map(itemFromXML))
        )
      })
    })
  );
}

function recipeFromXML(xml: Element): Result<GuideError, Chunk> {
  return checkTag("recipe")(xml).andThen((xml) =>
    result.all({
      id: attr("id")(xml),
      content: result.all({
        type: result.ok("recipe" as "recipe"),
        title: child("summary")(xml).map(
          (summary) => summary.textContent ?? ""
        ),
        items: children("step")(xml).andThen((choices) =>
          result.all(choices.map(itemFromXML))
        )
      })
    })
  );
}

function itemFromXML(xml: Element): Result<GuideError, Item> {
  return result.all({
    ref: attr("ref")(xml).orElse(result.ok(null)),
    text: result
      .ok(xml.textContent?.trim() ?? "")
      .map((text) => (text.length === 0 ? null : text))
  });
}

function attr(attrName: string): (xml: Element) => Result<GuideError, string> {
  return (xml) =>
    result.from(
      new GuideError(`Attribute <${attrName}> not found`, xml),
      xml.getAttribute(attrName)
    );
}

function child(tagName: string): (xml: Element) => Result<GuideError, Element> {
  return (xml) =>
    result.from(
      new GuideError(`Child <${tagName}> not found`, xml),
      xml.querySelector(`:scope > ${tagName}`)
    );
}

function children(
  tagName: string
): (xml: Element) => Result<GuideError, Element[]> {
  return (xml) =>
    result.ok(Array.from(xml.querySelectorAll(`:scope > ${tagName}`)));
}

function checkTag(
  tagName: string
): (xml: Element) => Result<GuideError, Element> {
  return (xml) =>
    xml.tagName === tagName
      ? result.ok(xml)
      : result.err(
          new GuideError(
            `Expected <${tagName}> but found <${xml.tagName}>`,
            xml.parentElement
          )
        );
}
