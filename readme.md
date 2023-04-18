# `ismism`

主义主义网站

## 网站结构

### `ismist.cn` 域名

- `/` 主页
- `/q/` query api 读接口
- `/p/` post api 写接口

### `nginx` 服务

- `0.0.0.0:80` 301-redirection 跳转至 `:443`
- `0.0.0.0:443` 网站服务
- `127.0.0.1:27017` 数据库
- `127.0.0.1:728` 数据服务
  - `127.0.0.1:729` 数据服务（备用）

## 程序结构

### 代码库

- `readme.md` 说明文档
- `nginx.conf` 服务配置
- `mongod.yaml` `mongod.service` 数据库配置
- `ssl`* 域名证书
- `tc.json`* 云服务密钥
- `jwk.json`* 网站密钥
- `cli` 服务命令
  - `build.zsh` 编译
  - `release.zsh` 发布
  - `remote/deploy.zsh` 部署
  - `start.zsh` 启动
  - `restart.zsh` 重启服务
  - `stop.zsh` 关闭
  - `log.zsh` 日志统计
  - `ser.js`* 数据服务
  - `dbset.js`* 数据库重置
  - `dbimport.zsh` 数据库导入
  - `dbexport.zsh` 数据库导出
  - `dbpull.zsh` 数据库同步到本地
- `ismist.ts` 数据服务
  - `cli` 命令
    - `bundle.ts` 打包
    - `dbset.ts` 数据库重置
  - `src` 源代码
    - `mod.ts` 库引用
    - `ont` 基础操作
      - `base.ts` 进制转换
      - `utc.ts` 标准时间
      - `json.ts` 基础类型
      - `crypt.ts` 加密计算
      - `jwt.ts` 签名计算
      - `adm.ts` 行政区
      - `sms.ts` 短信服务
  - `tst` 测试
  - `ui` 用户界面

### 运行环境

#### 服务器端

- `nginx`
- `deno`
- `mongodb`
- `zsh`

#### 用户端

- 网页浏览器，如 Chrome, Firefox, Safari, 微信浏览器等
  > 兼容性大于 `es2022`
