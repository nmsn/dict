import "reflect-metadata";
import { createConnection, getConnection, getRepository  } from "typeorm";
import { Dict } from "../entity/Dict";

interface DictItem {
  type: string;
  query: string;
  translation: string;
  from: string;
  to: string;
  time: Date;
  link?: string;
}


// TODO 后续移动到 app.ts 中
createConnection();


export const save = async (item: DictItem) => {
  const dict = new Dict();
  Object.entries(item).forEach(([key, value]) => {
    dict[key] = value;
  });

  await getConnection().manager.save(dict);
};

export class DictService {}
