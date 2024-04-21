# 【从零开发】主义主义网站

## 代码结构

* `src` 源代码 `source`
    * `ont` 基础计算 `ontic`
        - `base.ts` 进制转换
        - `utc.ts` 时间格式
        - `adm.ts` 行政区划
        - `json.ts` JSON数据声明
    * `eid` 核心代码 `eidetic`
        - `typ.ts` 数据类型声明
        - `db.ts` 数据库初始化与数据操作声明
        - `is.ts` 数据定义与检查
        - `id.ts` 实体数据操作
        - `usr.ts` 用户数据操作
        - `soc.ts` 俱乐部数据操作
        - `agd.ts` 活动数据操作
        - `rec.ts` 记录数据操作
        - `msg.ts` 文章数据操作
        - `aut.ts` 权限数据操作
    * `pra` 业务操作 `praxic`
* `tst` 测试代码 `tests`