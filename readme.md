# `ismism`

主义主义网站

## 网站结构

- `ismist.cn` 域名
  - `ismist.cn/q/` query api 读接口
  - `ismist.cn/p/` post api 写接口
- 服务器
  - `0.0.0.0:80` http-to-https 301-redirect 跳转
  - `0.0.0.0:443` https 服务
  - `127.0.0.1:27017` 数据库
  - `127.0.0.1:728` 数据服务

## 程序结构

`ismism` 代码库

- `readme.md` 说明文档
- `nginx.conf` https 服务配置
- `mongod.yaml` `mongod.service` 数据库配置
- `tc.json`* 云服务签名信息
- `jwk.json`* 网站密钥
- `cli` 服务器命令
  - `build.zsh` 编译构建
  - `dbexport.zsh` 数据库导出
  - `dbimport.zsh` 数据库导入
  - `dbpull.zsh` 数据库同步到本地
  - `dbset.js`* 数据库重置
  - `log.zsh` 日志统计
  - `release.zsh` 发布
  - `ser.js` 数据服务
  - `start.zsh` 启动
  - `stop.zsh` 关闭
- `ismism.ts` 数据服务
  - `cli` 命令
    - `bundle.ts` 打包
    - `dbset.ts` 数据库重置
  - `src` 源代码
    - `db.ts` 数据库接口
    - `ser.ts` 数据服务接口
    - `ont` 基础操作
      - `adm.ts` 行政区
      - `base.ts` 进制转换
      - `crypt.ts` 加密计算
      - `jwt.ts` 签名计算
      - `sms.ts` 电信短信
      - `utc.ts` 标准时间
    - `eid` 核心操作
      - `typ.ts` 类型声明
      - `is.ts` 数据定义
      - `id.ts` 实体数据
      - `usr.ts` 用户数据
      - `soc.ts` 小组数据
      - `agd.ts` 活动数据
      - `re.ts` 表态数据
      - `rel.ts` 关系数据
      - `rec.ts` 日志数据
      - `ord.ts` 订单数据
      - `md.ts` 文章数据
      - `aut.ts` 权限数据
      - `act.ts` 激活码
    - `pra.ts` 业务操作
      - `con.ts` 条件限制
      - `que.ts` 读接口
      - `doc.ts` 数据集
      - `pos.ts` 写接口
      - `pas.ts` 通行证
      - `pre.ts` 添加
      - `put.ts` 编辑
      - `pro.ts` 表态
  - `tst` 测试
    - `ont.test.ts` 基础操作测试
    - `eid.test.ts` 核心操作测试
    - `que.test.ts` 读接口测试
    - `pos.test.ts` 写接口测试
  - `ui` 图形界面
    - `bind` 接口绑定
      - `bind.ts` 绑定
      - `template.ts` 模版绑定
      - `section.ts` 模块绑定
      - `article.ts` 模组绑定
      - `nav.ts` 浏览器绑定
    - `index` 网页声明
      - `template.html` 模版声明
      - `style.css` 样式声明
      - `index.html` 网页声明
    - `ui.ts` 图形界面打包

## 运行环境

服务器端

- `nginx`
- `deno`
- `mongodb`
- `zsh`

用户端

- 网页浏览器
