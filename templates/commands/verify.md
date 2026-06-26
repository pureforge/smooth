---
name: "Smooth: Verify"
description: "验证实现并记录 harness 证据"
category: Workflow
tags: [workflow, verify, testing]
---

验证实现是否满足验收标准。创建验证清单，能跑的都跑起来，记录证据，并把真实问题沉淀成踩坑和经验。

**默认语言：除命令、文件名、代码标识、引用原文外，面向用户的回复和生成的 Smooth 文档都用简体中文。**

**记忆意识：** 开始前按需读取 `smooth/memory/user.md`、`smooth/memory/pitfalls.md` 和相关 `smooth/memory/domains/<topic>.md`。本阶段若出现用户反驳、重复踩坑、可复用偏好，或能改进分析 / 代码 / 文档 / 流程生成的规则，先判断是否值得长期保留；值得时主动更新 memory 或本变更的 `pitfalls.md` / `lessons.md`，一次性细节只修正当前输出。

**对话输出：** 面向用户先说明当前判断或正在做的动作，再给关键产物摘要和下一步。不要默认整篇粘贴产物内容，除非用户要求或内容很短；需要用户决策时给出少量选项，并标出推荐默认。

**输入**：可以指定变更名，例如 `/smooth:verify tracking-events-v2`。如果省略，就从对话上下文推断；如果不明确，先问用户。

---

## 你要做什么

1. **选择变更**

   如果提供了名称，就使用它。否则：
   - 从对话上下文推断
   - 如果只有一个活跃变更，自动选择
   - 如果不明确，列出可用变更并询问

   始终说明：`使用变更：<name>`

2. **读取完整上下文**

   读取变更目录里的所有产物：
   - `product.md`：验收标准和需求
   - `technical.md`：技术验收标准（如果存在）
   - `tasks.md`：已经实现了什么
   - `workpad.md`：验收、验证想法和疑问（如果存在）

3. **创建 `verify.md`**

   基于 `product.md` 和 `technical.md` 的验收标准，创建 `smooth/changes/<name>/verify.md`，推荐结构：

   ```markdown
   # 验证

   ## 代码审查
   - [ ] <根据实际 diff 生成的检查项，例如范围、副作用、约定、安全性等>

   ## 自动化检查
   - [ ] `npx @pureforge/smooth check <name>` — 在这里记录项目检查

   ## 证据
   - <运行过的命令、观察结果、结论>

   ## 手动验证
   > 这个变更影响 xxx 页面/模块，值得快速手动看一眼，确认关键路径正常。
   ```

   每一项都必须具体、可验证，不能是空泛的“能工作”。

4. **执行代码审查**

   查看实际代码 diff（用 `git diff` 对比基线或最近提交），根据真实变更生成检查项。重点看：
   - 改动是否严格落在任务范围内
   - 是否符合项目现有模式
   - 是否影响其他模块
   - 是否有可合并的重复代码
   - 是否存在安全问题
   - 错误处理是否合适
   - 能跑的验证命令是否已经跑过

   如果项目有配置好的检查，优先运行：

   ```bash
   npx @pureforge/smooth check <name>
   ```

   `smooth check` 会读取 `smooth.config.json`，否则优先 `make verify`，再不然自动检测 `lint`、`typecheck`、`test`、`build` 等脚本。不要把有权限或环境限制的检查直接推给用户，能本地跑的先本地跑。

   标记已完成项，或者报告发现的问题。若问题明显，建议回到 `/smooth:apply` 修复。

5. **记录踩坑和经验**

   验证阶段也是 harness 学习的地方。

   如果发现真实问题，创建或更新 `smooth/changes/<name>/pitfalls.md`：

   ```markdown
   # 踩坑记录

   ## <简短标题>
   - 症状：
   - 根因：
   - 如何被发现：
   - 修复 / 预防：
   - 这能改进 harness 吗：是 / 否 — <原因>
   ```

   如果提炼出可复用经验，创建或更新 `smooth/changes/<name>/lessons.md`：

   ```markdown
   # 经验沉淀

   ## <一句话说明未来该怎么做>
   - 来源：pitfalls.md#<section>
   - 适用范围：code-generation | doc-generation | workflow | project-check | config-default | tool-capability | guidance
   - Harness 改进：
     - 类型：generation-rule | document-rule | workflow-rule | project-check | config-default | tool-capability | guidance-update
     - 目标：<要改进的模板 / 配置 / 检查 / 工具 / 文档>
     - 方案：<能减少或避免这类问题的具体改动>
   - 机械方案：<可以用的命令 / 脚本 / lint 思路，或“无，需要判断”>
   ```

   不要为了填文件而虚构经验。没有明显踩坑也是合理结果，必要时简单记录即可。

6. **给手动验证提示**

   根据变更范围，给用户一句简短提示，说明重点手工看什么。保持 1-2 句，不要罗列穷尽测试。

7. **清理**

   所有检查完成后：
   - 删除临时测试代码或脚本
   - 保留 `verify.md` 作为记录

8. **建议下一步**

   全部通过后，建议归档：`所有检查都通过了。可以用 /smooth:archive 归档。`

---

## 守则

- 不要在验证阶段直接修 bug；如果失败了，建议回到 `/smooth:apply`。
- 检查项必须具体可验证，不能空泛。
- 如果问题能通过代码、命令、lint 或脚本捕获，就把它沉淀成 project-check 方案；如果是代码/文档/工作流生成方式的问题，就把它沉淀成模板、规则、配置、工具或指导更新。
- 清理临时文件、脚本和调试代码。
