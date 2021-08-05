import "reflect-metadata";
import { getConnection } from "typeorm";
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

export default class DictService {
  async save(item: DictItem) {
    const dict = new Dict();
    Object.entries(item).forEach(([key, value]) => {
      dict[key] = value;
    });

    try {
      await getConnection().manager.save(dict);
    } catch (e) {
      console.log(e);
    }
  }
  
  async findAll() {
    try {
      return await getConnection().createQueryBuilder().select('dict').from(Dict, 'dict').getMany();
    } catch (e) {
      console.log(e);
    }
  }
}
