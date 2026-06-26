---
name: smooth-archive
description: "归档已完成的变更。用户想在实现完成后收尾并归档时使用。"
metadata:
  author: smooth
  version: "1.0"
---

归档一个已完成的变更。

**默认语言：除命令、文件名、代码标识、引用原文外，面向用户的回复和生成的 Smooth 文档都用简体中文。**

**记忆意识：** 开始前按需读取 `smooth/memory/user.md`、`smooth/memory/pitfalls.md` 和相关 `smooth/memory/domains/<topic>.md`。本阶段若出现用户反驳、重复踩坑、可复用偏好，或能改进分析 / 代码 / 文档 / 流程生成的规则，先判断是否值得长期保留；值得时主动更新 memory 或本变更的 `pitfalls.md` / `lessons.md`，一次性细节只修正当前输出。

**对话输出：** 面向用户先说明当前判断或正在做的动作，再给关键产物摘要和下一步。不要默认整篇粘贴产物内容，除非用户要求或内容很短；需要用户决策时给出少量选项，并标出推荐默认。

**输入**：可以指定变更名，例如 `/smooth:archive tracking-events-v2`。如果省略，就从对话上下文推断；如果不明确，先问用户。

---

## 步骤

1. **选择变更**

   如果提供了名称，就使用它。否则：
   - 从对话上下文推断
   - 如果只有一个活跃变更，自动选择
   - 如果不明确，列出可用变更并询问

   对于分阶段的大需求，变更名可以是嵌套形式，例如 `big-feature/phase-1`。

2. **检查完成情况**

   读取 `tasks.md`，统计未完成任务（`- [ ]` 和 `- [x]`）。

   **如果还有未完成任务：**
   - 显示未完成数量
   - 询问用户是否继续
   - 用户确认后再继续

3. **检查 harness 记录**

   归档前检查：
   - `verify.md`：是否记录了验证命令、观察和结论
   - `pitfalls.md`：是否记录了这次变更中真实出现的踩坑
   - `lessons.md`：是否记录了可复用经验和 harness 改进方向

   如果没有 `verify.md`，要提醒用户这次变更没有验证证据。
   如果没有明显踩坑或经验，也可以直接说明，不要为了填文件而编造。
   如果 `lessons.md` 存在，要总结它打算推动哪类 harness 改进：
   - 代码或技术设计生成规则
   - Smooth 产物的文档规则
   - 阶段流转或验证行为的工作流规则
   - `smooth.config.json` 或项目脚本里的 project check
   - 配置默认、工具能力或指导更新

   如果某条经验只写了“候选检查”或没有具体 `Harness 改进` 目标，归档前先补上。经验应该说清楚要改进 harness 的哪一部分，而不只是说发生了什么。

4. **执行归档**

   一次只归档一个变更。若是嵌套阶段，只归档该阶段，保留外层容器目录。归档目录要把 `/` 换成 `-`。

   ```bash
   mkdir -p smooth/archive
   # 普通变更 "foo"：            mv smooth/changes/foo            smooth/archive/$(date +%Y-%m-%d)-foo
   # 嵌套阶段 "big/phase-1"：    mv smooth/changes/big/phase-1    smooth/archive/$(date +%Y-%m-%d)-big-phase-1
   mv "smooth/changes/<name>" "smooth/archive/$(date +%Y-%m-%d)-<name-with-slashes-as-dashes>"
   ```

   如果这是容器里最后一个阶段，且容器目录已经为空，就删除空容器。

5. **展示总结**

   ```text
   ## 归档完成

   **变更：** <change-name>
   **归档到：** smooth/archive/YYYY-MM-DD-<name>/

   任务：X/Y 已完成
   验证：有 / 无
   踩坑 / 经验：有 / 无
   Harness 改进：<改进目标摘要，或“无”>
   ```

---

## 守则

- 如果没有提供变更名，一定要先确认选择。
- 不要因为还有未完成任务就阻止归档；先提醒，再让用户确认。
- 移动时保留所有文件。
- 说明要清楚，别让用户猜发生了什么。
