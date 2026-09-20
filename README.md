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

在 Cocos 项目目录执行即可，无需 `cocos-ci.json`。Windows 下会按项目 `package.json` 中的 `creator.version` 查找 `%ProgramData%\cocos\editors\Creator\<version>\CocosCreator.exe`。如果当前目录有 `cocos-ci.json`，优先使用其中的 `creatorPath` 和 `projectPath`：

```bash
cocos-ci open
```

也可以临时覆盖路径；编辑器安装在其他位置时使用 `--editor`：

```powershell
cocos-ci open --project "C:\Users\idora\Projects\wm_diner\client" --editor "C:\ProgramData\cocos\editors\Creator\3.8.7\CocosCreator.exe"
```

命令在编辑器进程启动后退出，编辑器继续运行；启动成功不代表项目已完成加载。
