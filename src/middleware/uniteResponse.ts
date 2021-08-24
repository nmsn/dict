interface OptionProps {
  type?: string;
  successCode?: number;
  successMsg?: string;
  failCode?: number;
  failMsg?: string;
};


/**
 * Created by ux34 on 21/6/4
 * 统一接口返回数据格式
 * @param option 默认配置
 * @param option.type 返回的格式
 * @param option.successCode 请求成功返回的状态码
 * @param option.successMsg 请求成功返回的消息
 * @param option.failCode 请求失败返回的状态码
 * @param option.failMsg 请求失败返回的消息
 * @returns {function} koa中间件
 */
const uniteResponse = (option: OptionProps = {}) => {
  return async function (ctx, next) {
    ctx.success = function (data, msg, code) {
      ctx.status = code || option.successCode || 200;
      ctx.type = option.type || "json";
      ctx.body = {
        code: code || option.successCode || 200,
        msg: msg || option.successMsg || "success",
        data: data,
      };
    };

    ctx.fail = function (msg, code) {
      ctx.status = code || option.failCode || 400;
      ctx.type = option.type || "json";
      ctx.body = {
        code: code || option.failCode || 400,
        msg: msg || option.failMsg || "fail",
      };
    };

    await next();
  };
};

export default uniteResponse;
