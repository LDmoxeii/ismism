# 【从零开发】主义主义网站

## 代码结构

* `src` 源代码 `source`
    * `ont` 基础操作 `ontic`
        - `base.ts` 进制转换
        - `utc.ts` 时间格式 `Universal Time Convention`
        - `crypt.ts` 签名验证 `cryptography` 
        - `jwt.ts` 身份验证 `JSON Web Token`
        - `adm.ts` 行政区划 `administrative region`
        - `json.ts` JSON数据声明
    * `eid` 核心代码 `eidetic`
        - `typ.ts` 数据类型声明
        - `db.ts` 数据库初始化与数据操作声明 `database`
        - `is.ts` 数据定义与检查
        - `id.ts` 实体数据操作 `identity`
        - `usr.ts` 用户数据操作 `user`
        - `soc.ts` 俱乐部数据操作 `sociation` `social`
        - `agd.ts` 活动数据操作 `agenda`
        - `rec.ts` 记录数据操作 `record`
        - `msg.ts` 文章数据操作 `message`
        - `aut.ts` 权限数据操作 `author` `authority`
    * `pra` 业务操作 `praxic`
        - `can.ts` 操作权限
		- `doc.ts` 数据组合 `document`
		- `que.ts` 查询接口 `query`
        - `pas.ts` 用户登陆 `pass`
    * `ser.ts` 服务接口 `serve`
* `tst` 测试代码 `tests`