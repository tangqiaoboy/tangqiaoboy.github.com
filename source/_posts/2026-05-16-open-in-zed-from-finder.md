---
title: 从 Sublime Text 到 Zed
date: 2026-05-16 15:00:00
---

## 从 Sublime Text 到 Zed

我用 Sublime Text 很多年了。它曾经是那个年代最好的编辑器：启动极快、界面干净、插件生态丰富。但这两年随着 AI 辅助编码成为日常，Sublime Text 的 AI 集成体验始终差一口气，我开始认真考虑迁移。

[Zed](https://zed.dev) 是一款由 Atom 和 Tree-sitter 的原班人马打造的编辑器，用 Rust 编写，主打两件事：**极致的性能**和**原生的 AI 协作**。它的启动速度和文件响应比 VS Code 快得多，同时内置了对 Claude、GPT 等模型的支持，不需要额外装插件。界面风格上它和 Sublime Text 一脉相承——极简、无干扰——这让我迁移的心理成本低了不少。

{% img /images/zed.jpg %}

用了一段时间之后，感觉不错，分享给大家。

## 安装 Zed CLI

打开 Zed，按下 `cmd+shift+p`，输入 `Install`，选择安装 cli。这一步会把 `zed` 命令行工具安装到 `~/.local/bin/zed`，后面脚本依赖它来打开编辑器。

{% img /images/zed-1.jpg %}

安装完成后在终端验证一下：

```bash
zed --version
```

装好 CLI 之后，日常在终端里就能直接调起 Zed，几个最常用的姿势：

```bash
# 用当前目录作为工作区打开
zed .

# 打开单个文件
zed README.md

# 打开多个文件，会在同一窗口里以多标签呈现
zed src/main.rs src/lib.rs

# 新开一个独立窗口，不复用当前窗口
zed -n .

# 等待文件关闭后再返回（常用于 git commit、crontab -e 等场景）
zed -w COMMIT_EDITMSG

# 对比两个文件的差异
zed --diff a.txt b.txt
```

## 在 Finder 的右键菜单中集成 Zed

macOS 内置了一套叫**快速操作（Quick Actions）**的机制，配合 Automator 可以把任意脚本挂到 Finder 的右键菜单里，可以做到把 Zed 集成到菜单里。

### 实现原理

macOS 的服务（Services）机制允许我们把一个 `.workflow` 文件注册为系统服务。当用户在 Finder 里右键某个文件夹时，系统会把选中的路径传入这个 workflow，由里面的 Shell 脚本来处理。

我们只需要让脚本调用 `zed` 命令打开对应路径即可。

### 安装步骤

#### 第一步：创建 Automator Workflow

用下面这个一键生成脚本，在终端执行后会直接在当前目录产出 `OpenInZed.workflow`：

```bash
#!/bin/bash
# 一键生成 OpenInZed.workflow

set -e
DEST="$HOME/Desktop/OpenInZed.workflow/Contents"
mkdir -p "$DEST"

cat > "$DEST/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSServices</key>
  <array>
    <dict>
      <key>NSMenuItem</key>
      <dict>
        <key>default</key>
        <string>在 Zed 中打开</string>
      </dict>
      <key>NSMessage</key>
      <string>runWorkflowAsService</string>
      <key>NSRequiredContext</key>
      <dict>
        <key>NSApplicationIdentifier</key>
        <string>com.apple.finder</string>
      </dict>
      <key>NSSendFileTypes</key>
      <array>
        <string>public.folder</string>
      </array>
    </dict>
  </array>
</dict>
</plist>
PLIST

python3 - << 'PYEOF'
content = open('/dev/stdin').read() if False else r"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>AMApplicationBuild</key><string>521.1</string>
  <key>AMApplicationVersion</key><string>2.10</string>
  <key>AMDocumentVersion</key><string>2</string>
  <key>actions</key>
  <array>
    <dict>
      <key>action</key>
      <dict>
        <key>ActionBundlePath</key>
        <string>/System/Library/Automator/Run Shell Script.action</string>
        <key>ActionName</key><string>Run Shell Script</string>
        <key>ActionParameters</key>
        <dict>
          <key>COMMAND_STRING</key>
          <string>for f in "$@"
do
  if [ -d "$f" ]; then TARGET="$f"; else TARGET=$(dirname "$f"); fi
  if command -v zed &amp;>/dev/null; then
    zed "$TARGET"
  elif [ -x "$HOME/.local/bin/zed" ]; then
    "$HOME/.local/bin/zed" "$TARGET"
  else
    open -a "Zed" "$TARGET"
  fi
done</string>
          <key>CheckedForUserDefaultShell</key><true/>
          <key>inputMethod</key><integer>1</integer>
          <key>shell</key><string>/bin/bash</string>
          <key>source</key><string></string>
        </dict>
        <key>BundleIdentifier</key>
        <string>com.apple.automator.runShellScript</string>
        <key>CFBundleVersion</key><string>2.0.3</string>
        <key>CanShowSelectedItemsWhenRun</key><false/>
        <key>CanShowWhenRun</key><true/>
        <key>isViewVisible</key><true/>
      </dict>
      <key>isViewVisible</key><true/>
    </dict>
  </array>
  <key>connectors</key><dict/>
  <key>workflowMetaData</key>
  <dict>
    <key>serviceInputTypeIdentifier</key>
    <string>com.apple.Automator.fileSystemObject.folder</string>
    <key>serviceOutputTypeIdentifier</key>
    <string>com.apple.Automator.nothing</string>
    <key>serviceProcessesInput</key><integer>0</integer>
    <key>workflowTypeIdentifier</key>
    <string>com.apple.Automator.servicesMenu</string>
  </dict>
</dict>
</plist>"""
import os
dest = os.path.expanduser("~/Desktop/OpenInZed.workflow/Contents/document.wflow")
with open(dest, "w") as f:
    f.write(content)
print("document.wflow written")
PYEOF

echo "✅ OpenInZed.workflow 已生成到桌面，双击即可安装"
```

#### 第二步：安装 Workflow

把生成好的 `OpenInZed.workflow` 双击打开，系统弹出确认框后点击**「安装」**即可。

#### 第三步：刷新服务缓存

安装后在终端执行一次：

```bash
/System/Library/CoreServices/pbs -flush
```

这会强制 macOS 重新扫描已安装的服务，避免右键菜单没有立刻出现新选项。

#### 第四步：在系统设置中确认启用

打开 **系统设置 → 键盘 → 键盘快捷键 → 服务 → 文件和文件夹**，找到「在 Zed 中打开」并勾选。

{% img /images/zed-2.jpg %}

### 使用效果

配置完成后，在 Finder 中右键任意文件夹，选择 **快速操作 → 在 Zed 中打开**，Zed 会直接以该目录为工作区启动。

如果右键的是普通文件而非文件夹，脚本会自动取其父目录打开，不会报错。

### 几点说明

**为什么不用 Finder 扩展（FinderSync）？** FinderSync 需要开发一个完整的 Xcode 项目并签名，成本远高于 Automator workflow，对于这个简单需求来说完全没必要。

**为什么脚本里要三重兜底？** Zed 的 CLI 路径在不同安装方式下不一样。通过 `Zed → Install CLI` 安装的会在 `~/.local/bin/zed`，手动加到 PATH 的会被 `command -v zed` 找到，而 `open -a "Zed"` 则是最后的保险，只要 Zed.app 在 `/Applications` 里就一定能用。

**如何卸载？** 删除 `~/Library/Services/OpenInZed.workflow` 这个文件夹即可，不会留下任何残余。
