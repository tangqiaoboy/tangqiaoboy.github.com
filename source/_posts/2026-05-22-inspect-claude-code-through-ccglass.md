---
title: 了解 Claude Code 的提示词工程
date: 2026-05-22 23:25:23
tags: AI
---

虽然同样是调用 Opus 4.7 模型，但是不同的编程工具展现的表现确不一样。就拿 Claude Code, Cursor, OpenCode，Windsurf 这几个产品来说，显然 Claude Code 在程序员中的口碑更好。

那 Claude Code 与其它编程工具的差异性在哪儿呢？其中有一个重要的环节就是：提示词工程(prompt engine)。

正好我今天看到了 [ccglass](https://github.com/jianshuo/ccglass) 这个开源项目，它可以把 Claude Code 的提示词通过网络请求截取出来，于是我试了一下，给大家分享一下我看到的有趣的地方。

整个提示词分为：系统层、消息层、工具层。这三层的提示词是拼接在一起发给服务器的。


## 系统层

我们先看系统层，这一层规定了 Claude Code 的人设，工作原则和方法，以及记忆。

### 著名的 cch header

在提示词的最顶部，你能看到这样一行：

```
x-anthropic-billing-header: cc_version=2.1.148.90a; cc_entrypoint=cli; cch=06d7a;
```

这行最后的 cch 参数，就是造成 claude code 配置别的大语言模型缓存失效的元凶。因为模型调用的缓存是基于“前缀”的，如果你的提示词前面都没变，只是在最后加了一句新的对话。那么前面的缓存都会命中。但是 claude code 在今年 2 月的升级中加入了这个参数，在每轮对话中 cch 参数都会变，如果别的模型不特殊处理这个参数，就会造成所有缓存失效。

### 人设

告诉它是官方的，并且主要是做软件工程相关的任务。

提示词如下：
```
You are Claude Code, Anthropic's official CLI for Claude.

You are an interactive agent that helps users with software engineering tasks.
```

### 禁止干坏事

提示词中明确禁止了做破坏性（比如 DoS 攻击）的事情，一些高风险的事情，也会要求用户澄清用处。

提示词如下：

```
Refuse requests for destructive techniques, DoS attacks, mass targeting, supply chain compromise, or detection evasion for malicious purposes. Dual-use security tools (C2 frameworks, credential testing, exploit development) require clear authorization context: pentesting engagements, CTF competitions, security research, or defensive use cases.
```

### 记忆

提示词中为每个目录都创建了记忆，让 Agent 需要的时候把记忆保存下来。

像我的这个实验项目，记忆文件就在 `/Users/tangqiao/.claude/projects/-Users-tangqiao-ccglass/memory/`。

提示词如下：

```
You have a persistent, file-based memory system at `/Users/tangqiao/.claude/projects/-Users-tangqiao-ccglass/memory/`. This directory already exists — write to it directly with the Write tool (do not run mkdir or check for its existence).

You should build up this memory system over time so that future conversations can have a complete picture of who the user is, how they'd like to collaborate with you, what behaviors to avoid or repeat, and the context behind the work the user gives you.

If the user explicitly asks you to remember something, save it immediately as whichever type fits best. If they ask you to forget something, find and remove the relevant entry.
```

关于记忆，提示词中还规定了什么时候保存，怎么保存。

提示词如下：

```
## How to save memories

Saving a memory is a two-step process:

**Step 1** — write the memory to its own file (e.g., `user_role.md`, `feedback_testing.md`) using this frontmatter format:

此处省略

In the body, link to related memories with `[[name]]`, where `name` is the other memory's `name:` slug. Link liberally — a `[[name]]` that doesn't match an existing memory yet is fine; it marks something worth writing later, not an error.

**Step 2** — add a pointer to that file in `MEMORY.md`. `MEMORY.md` is an index, not a memory — each entry should be one line, under ~150 characters: `- [Title](file.md) — one-line hook`. It has no frontmatter. Never write memory content directly into `MEMORY.md`.

```

### 只有 200 行的记忆限额

提示词如下：
```
`MEMORY.md` is always loaded into your conversation context — lines after 200 will be truncated, so keep the index concise
```

## 消息层

这一层定义了它能使用的各种工具。

### skill

所有的 skill 在这一层被提示词引入，你能看到这样的提示词开头：

```
The following skills are available for use with the Skill tool:
```

我因为之前装过 hyperframes，所以我看到了大量 hyperframes 的 skill。

我这才知道 hyperframes 这个框架一共有 16 个 skill，每次我用 claude code，这些 skill 都被注入到了提示词。

hyperframes 引入了一共有多少提示词呢？给大家看一下：

```
- hyperframes: Create video compositions, animations, title cards, overlays, captions, voiceovers, audio-reactive visuals, and scene transitions in HyperFrames HTML. Use when asked to build any HTML-based video content, add captions or subtitles synced to audio, generate text-to-speech narration, create audio-reactive animation (beat sync, glow, pulse driven by music), add animated text highlighting (marker sweeps, hand-drawn circles, burst lines, scribble, sketchout), or add transitions between scenes (crossfades, wipes, reveals, shader transitions). Covers composition authoring, timing, media, and the full video production workflow. For CLI commands (init, lint, preview, render, transcribe, tts) see the hyperframes-cli skill.
- website-to-hyperframes: Capture a website and create a HyperFrames video from it. Use when: (1) a user provides a URL and wants a video, (2) someone says "capture this site", "turn this into a video", "make a promo from my site", (3) the user wants a social ad, product tour, or any video based on an existing website, (4) the user shares a link and asks for any kind of video content. Even if the user just pastes a URL — this is the skill to use.
- remotion-to-hyperframes: Translate an existing Remotion (React-based) video composition into a HyperFrames HTML composition. Use ONLY when the user explicitly asks to port, convert, migrate, translate, or rewrite a Remotion composition as HyperFrames — for example "port my Remotion project to HyperFrames", "convert this Remotion code to HyperFrames", "migrate from Remotion", "translate this Remotion comp", or "rewrite this as HyperFrames HTML". Do NOT use when (a) the user is authoring a NEW HyperFrames composition, even if they have or are A/B-testing a similar Remotion video; (b) the user mentions Remotion in passing without asking for migration; (c) the user shares Remotion code as reference material rather than asking for a translation; (d) the user asks for "the same video as my Remotion one" without explicitly asking to migrate the source — treat that as a fresh HyperFrames build. When in doubt, default to authoring a native HyperFrames composition with the `hyperframes` skill instead. Skill detects unsupported patterns (useState, useEffect with side effects, async calculateMetadata, third-party React component libraries, `@remotion/lambda` features) and recommends the runtime interop escape hatch instead of attempting a lossy translation.
- hyperframes-cli: HyperFrames CLI tool — hyperframes init, lint, inspect, preview, render, transcribe, tts, doctor, browser, info, upgrade, compositions, docs, benchmark. Use when scaffolding a project, linting, validating, inspecting visual layout in compositions, previewing in the studio, rendering to video, transcribing audio, generating TTS, or troubleshooting the HyperFrames environment.
- waapi: Web Animations API adapter patterns for HyperFrames. Use when authoring element.animate() motion, Animation currentTime seeking, document.getAnimations(), KeyframeEffect timing, fill modes, or native browser animations that must render deterministically in HyperFrames.
- animejs: Anime.js adapter patterns for HyperFrames. Use when writing Anime.js animations or timelines inside HyperFrames compositions, registering animations on window.__hfAnime, making Anime.js seek-driven and deterministic, or translating Anime.js examples into render-safe HyperFrames HTML.
- hyperframes-registry: Install and wire registry blocks and components into HyperFrames compositions. Use when running hyperframes add, installing a block or component, wiring an installed item into index.html, or working with hyperframes.json. Covers the add command, install locations, block sub-composition wiring, component snippet merging, and registry discovery.
- three: Three.js and WebGL adapter patterns for HyperFrames. Use when creating deterministic Three.js scenes, WebGL canvas layers, AnimationMixer timelines, camera motion, shader-driven visuals, or canvas renders that respond to HyperFrames hf-seek events.
- tailwind: Tailwind CSS v4.2 browser-runtime patterns for HyperFrames compositions. Use when scaffolding or editing projects created with `hyperframes init --tailwind`, writing Tailwind utility classes in composition HTML, adding CSS-first Tailwind v4 theme tokens, debugging v3 vs v4 syntax, or deciding when to compile Tailwind to CSS instead of using the browser runtime.
- hyperframes-media: Asset preprocessing for HyperFrames compositions — text-to-speech narration (Kokoro), audio/video transcription (Whisper), and background removal for transparent overlays (u2net). Use when generating voiceover from text, transcribing speech for captions, removing the background from a video or image to use as a transparent overlay, choosing a TTS voice or whisper model, or chaining these (TTS → transcribe → captions). Each command downloads its own model on first run.
- lottie: Lottie and dotLottie adapter patterns for HyperFrames. Use when embedding lottie-web JSON animations, .lottie files, @lottiefiles/dotlottie-web players, registering instances on window.__hfLottie, or making After Effects exports deterministic in HyperFrames.
- gsap: GSAP animation reference for HyperFrames. Covers gsap.to(), from(), fromTo(), easing, stagger, defaults, timelines (gsap.timeline(), position parameter, labels, nesting, playback), and performance (transforms, will-change, quickTo). Use when writing GSAP animations in HyperFrames compositions.
- css-animations: CSS animation adapter patterns for HyperFrames. Use when authoring CSS keyframes, animation-delay based timing, animation-fill-mode, animation-play-state, or CSS-only motion that HyperFrames must seek deterministically during preview and rendering.
```

怎么说呢？反正我立马把它卸载了。我给 claude code 的提示词如下：

```
我曾经用 npx skills add heygen-com/hyperframes 命令增加了 hyperframes skill, 现在我希望你帮我把这个 skill 删除掉。
```

### 用户人设和时间

其实 claude code 知道你的信息，相关提示词如下：

```
<system-reminder>
As you answer the user's questions, you can use the following context:
# userEmail
The user's email address is xxx@xxx.com .
# currentDate
Today's date is 2026/05/22.

IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
</system-reminder>
```

### 用户的问题

用户输入的问题被放在了这里。

注意，每轮对话，它会把之前所有的对话都带上，直到上下文超限，才会进行压缩。

有意思的是，你能看到它不但带上了我的输入，还带上了工具执行的结果。所以对话的上下文增长的速度也非常快。

就比如我让它删除 hyperframes 的输入，它因为调用了 10 来次工具，使得我已经无法在这儿把所有的上下文贴给大家了。

## 工具层

有意思的是，工具层虽然也是可以缓存的部分，但是 claude code 把它放在了消息层后面。我猜这也是一个对抗其它模型缓存的办法，其它模型需要主动地把工具层部分的提示词也单独计算，否则它一定会因为夹在中间的用户输入而失效（心机重的 Anthropic 啊！）。

### 鼓励使用子 Agent

```
Launch a new agent to handle complex, multi-step tasks. Each agent type has specific capabilities and tools available to it.
```

### 如何提问

教大模型如何向用户提问，Claude code 有时候会弹出单选/复选框，就是这个提示词在起作用。

```
Use this tool when you need to ask the user questions during execution. This allows you to:
1. Gather user preferences or requirements
2. Clarify ambiguous instructions
3. Get decisions on implementation choices as you work
4. Offer choices to the user about what direction to take.

Usage notes:
- Users will always be able to select "Other" to provide custom text input
- Use multiSelect: true to allow multiple answers to be selected for a question
- If you recommend a specific option, make that the first option in the list and add "(Recommended)" at the end of the label
```

### bash

所有的 bash 命令，也会在这一层被介绍给 Claude code 具体的使用方法。

比如 Read 命令的提示词如下：

```
Reads a file from the local filesystem. You can access any file directly by using this tool.
Assume this tool is able to read all files on the machine. If the User provides a path to a file assume that path is valid. It is okay to read a file that does not exist; an error will be returned.

Usage:
- The file_path parameter must be an absolute path, not a relative path
- By default, it reads up to 2000 lines starting from the beginning of the file
- When you already know which part of the file you need, only read that part. This can be important for larger files.
- Results are returned using cat -n format, with line numbers starting at 1
- This tool allows Claude Code to read images (eg PNG, JPG, etc). When reading an image file the contents are presented visually as Claude Code is a multimodal LLM.
- This tool can read PDF files (.pdf). For large PDFs (more than 10 pages), you MUST provide the pages parameter to read specific page ranges (e.g., pages: "1-5"). Reading a large PDF without the pages parameter will fail. Maximum 20 pages per request.
- This tool can read Jupyter notebooks (.ipynb files) and returns all cells with their outputs, combining code, text, and visualizations.
- This tool can only read files, not directories. To list files in a directory, use the registered shell tool.
- You will regularly be asked to read screenshots. If the user provides a path to a screenshot, ALWAYS use this tool to view the file at the path. This tool will work with all temporary file paths.
- If you read a file that exists but has empty contents you will receive a system reminder warning in place of file contents.
- Do NOT re-read a file you just edited to verify — Edit/Write would have errored if the change failed, and the harness tracks file state for you.

— schema —
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "file_path": {
      "description": "The absolute path to the file to read",
      "type": "string"
    },
    "offset": {
      "description": "The line number to start reading from. Only provide if the file is too large to read at once",
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "description": "The number of lines to read. Only provide if the file is too large to read at once.",
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "pages": {
      "description": "Page range for PDF files (e.g., \"1-5\", \"3\", \"10-20\"). Only applicable to PDF files. Maximum 20 pages per request.",
      "type": "string"
    }
  },
  "required": [
    "file_path"
  ],
  "additionalProperties": false
}
```

### MCP

所有的 MCP 在这一层被一一介绍。

比如这个 mcp__claude-in-chrome__tabs_create_mcp：

```
Creates a new empty tab in the MCP tab group. CRITICAL: You must get the context using tabs_context_mcp at least once before using other browser automation tools so you know what tabs exist.

— schema —
{
  "type": "object",
  "properties": {},
  "required": []
}
```

### 调用 skill

虽然 skill 是在消息层注入的，但是工具层教大模型什么时候调用 skill。

```
When users reference a "slash command" or "/<something>", they are referring to a skill. Use this tool to invoke it.

How to invoke:
- Set `skill` to the exact name of an available skill (no leading slash). For plugin-namespaced skills use the fully qualified `plugin:skill` form.
- Set `args` to pass optional arguments.
```

## 结束语

最后给大家讲个题外话，ccglass 这个开源项目是百姓网CEO王建硕的作品，感谢王建硕先生！
