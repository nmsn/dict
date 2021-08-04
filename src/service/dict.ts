import "reflect-metadata";
import { createConnection } from "typeorm";
import { Dict } from "../entity/Dict";

interface DictItem {
  id: number;
  type: string;
  query: string;
  translation: string;
  from: string;
  to: string;
  time: Date;
}

export const save = (item: DictItem) => {
  createConnection()
    .then(async (connection) => {
      // console.log("Inserting a new user into the database...");
      const dict = new Dict();
      
      Object.entries(item).forEach(([key,value]) => {
        dict[key] = value;
      });

      await connection.manager.save(dict);
    })
    .catch((error) => console.log(error));
};
