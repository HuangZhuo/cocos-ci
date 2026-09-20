命令行构建 Cocos Creator 项目

_Powered by Trae CN_

- init 初始化生成配置文件
- version 代码版本
    - show 显示版本
    - bump 更新版本
- build 构建
- open 直接使用编辑器打开项目，跳过 Dashboard，传入 `--nologin`
- preview 预览
- publish 发布
- hotupdate 热更新
    - generate 生成
    - upload 上传
    - rollback 回滚 #todo

## Setup

```bash
pnpm i
npm run build
npm link
```

## Usage

在含有 `cocos-ci.json` 的目录执行，默认使用配置中的 `creatorPath` 和 `projectPath`：

```bash
cocos-ci open
```

也可以临时覆盖路径（仍需当前目录存在 `cocos-ci.json`）：

```powershell
cocos-ci open --project "C:\Users\idora\Projects\wm_diner\client" --editor "C:\ProgramData\cocos\editors\Creator\3.8.7\CocosCreator.exe"
```

命令在编辑器进程启动后退出，编辑器继续运行；启动成功不代表项目已完成加载。
