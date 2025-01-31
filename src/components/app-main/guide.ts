import { Maybe } from "../../maybe";
import * as maybe from "../../maybe";

export type Id = string;

export type Guide = Map<Id, Chunk>;

export type Chunk = {
  id: Id;
  content: Content;
};

export type Menu = {
  type: "menu";
  title: string;
  items: Item[];
};

export type Recipe = {
  type: "recipe";
  title: string;
  items: Item[];
};

export type Content = Menu | Recipe;

export type Item = {
  ref: Id | null;
  text: string | null;
};

export function get(guide: Guide, id: string): Maybe<Chunk> {
  return maybe.from(guide.get(id));
}

export function getRoot(guide: Guide): Maybe<Chunk> {
  return get(guide, "root");
}
