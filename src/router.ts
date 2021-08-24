import * as Router from "koa-router";
import DictController from "./controller/dict";

const router = new Router();
const dict = new DictController();

router.get("/baidu/:word", dict.getBaiduDict);
router.get("/youdao/:word", dict.getYoudaoDict);
router.post("/dict/word", dict.getWord);
router.get("/dict/all", dict.findAll);
router.get("/dict/allMonth", dict.findAllCurMonth);
router.get("/dict/allWeek", dict.findAllCurWeek);
router.get("/dict/allType/:type", dict.findAllType);
router.get("/dict/group", dict.findGroup);

router.get("/", async (ctx, next) => {
  ctx.response.body = "<h1>dict</h1>";
});

export default router;
