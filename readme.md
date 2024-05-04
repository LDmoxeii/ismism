## 代码结构

* `ismism.ts` 编译环境
	* `cli` 命令接口 `command line interface`
		- `sendsms.ts` 发送测试短信
		- `bundle.ts` 编译并打包 `build and bundle`
	* `src` 源代码 `source`
		* `ont` 基础操作 `ontic`
			- `base.ts` 进制转换
			- `utc.ts` 时间格式 `Universal Time Convention`
			- `crypt.ts` 签名验证 `cryptography`
			- `jwt.ts` 身份验证 `JSON Web Token`
			- `adm.ts` 行政区划 `administrative region`
			- `json.ts` JSON数据声明
		* `eid` 核心操作 `eidetic`
			- `typ.ts` 数据类型声明 `type`
			- `db.ts` 数据库初始化与数据操作类型声明 `database`
			- `is.ts` 数据定义与检查
			- `id.ts` 实体数据操作 `identity`
			- `usr.ts` 用户数据操作 `user`
			- `soc.ts` 俱乐部数据操作 `sociation` `social`
			- `agd.ts` 活动数据操作 `agenda`
			- `rec.ts` 记录数据操作 `record` - `credit` `debit` `earn`
			- `msg.ts` 文章数据操作 `message` - `wsl` `lit`
			- `aut.ts` 权限数据操作 `author` `authority`
		* `pra` 业务操作 `praxic`
			- `can.ts` 操作权限
			- `doc.ts` 数据组合 `document`
			- `que.ts` 查询接口 `query` `HTTP GET` 对数据组合做请求
			- `pas.ts` 用户登陆 `pass` (的操作组合)
			- `pre.ts` 创建操作 `pre-data` `prepare` （的操作组合）
			- `put.ts` 更新操作 `put-data`（的操作组合）
			- `pos.ts` 请求接口 `post` `HTTP POST` 对操作组合做请求
		* `ser.ts` 服务接口 `serve`
	* `tst` 测试代码 `tests`
	* `ui` 图形界面 `graphical user interface`
		* `index` UI声明（HTML/CSS）
			- `index.html` UI入口 
			- `template.html` UI元素
			- `style.css` UI样式
		* `bind` UI定义（TS/JS）绑定服务器端与浏览器端的数据
			- `bind.ts` 绑定UI入口
			- `template.ts` 绑定UI元素
		* `ui.ts` 打包UI `ui bundle`
* `cli` 命令接口（运行环境）（服务器端）
	- `build.zsh` 构建运行环境
* `ui` 图形界面（运行环境）（浏览器端）
* `mongod.service` `mongod.yaml` 数据库配置（服务器端）
* `nginx.conf` 端口配置（服务器端）

## [系列视频](https://space.bilibili.com/483417795/video)
