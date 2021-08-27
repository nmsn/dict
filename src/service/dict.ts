import "reflect-metadata";
import { getConnection } from "typeorm";
import * as dayjs from "dayjs";
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
      return await getConnection()
        .createQueryBuilder()
        .select("dict")
        .from(Dict, "dict")
        .getMany();
    } catch (e) {
      console.log(e);
    }
  }

  async findAllCurWeek() {
    try {
      return await getConnection()
        .createQueryBuilder()
        .select("dict")
        .where("dict.time > :start", {
          start: dayjs().startOf("week").format(),
        })
        .andWhere("dict.time < :end", { end: dayjs().endOf("week").format() })
        .from(Dict, "dict")
        .getMany();
    } catch (e) {
      console.log(e);
    }
  }

  async findAllCurMonth() {
    try {
      return await getConnection()
        .createQueryBuilder()
        .select("dict")
        .where("dict.time > :start", {
          start: dayjs().startOf("month").format(),
        })
        .andWhere("dict.time < :end", { end: dayjs().endOf("month").format() })
        .from(Dict, "dict")
        .getMany();
    } catch (e) {
      console.log(e);
    }
  }

  async findAllType(type = "baidu") {
    try {
      return await getConnection()
        .createQueryBuilder()
        .select("dict")
        .where("dict.type = :type", { type })
        .from(Dict, "dict")
        .getMany();
    } catch (e) {
      console.log(e);
    }
  }

  async findGroup(type = "baidu") {
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .select("dict.query", "query")
        .addSelect("COUNT(*)", "count")
        .where("dict.type = :type", { type })
        .from(Dict, "dict")
        .groupBy("dict.query")
        // getMany 只能获取实体数据 sum count 等需要用 getRawMany
        .getRawMany();
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async findGroupStatByTime(type = "baidu", period: "week" | "month" | "year", limit = 10) {
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .select("dict.query", "query")
        .addSelect("COUNT(*)", "count")
        .where("dict.type = :type", { type })
        .andWhere("dict.time > :start", {
          start: dayjs().startOf(period).format(),
        })
        .andWhere("dict.time < :end", { end: dayjs().endOf(period).format() })
        .groupBy("dict.query")
        .limit(limit)
        .orderBy("count", "DESC")
        .from(Dict, "dict")
        // getMany 只能获取实体数据 sum count 等需要用 getRawMany
        .getRawMany();
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  }
}
