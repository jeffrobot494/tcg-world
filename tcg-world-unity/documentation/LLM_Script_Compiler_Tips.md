# LLM Script Compiler Design Tips for a TCG Engine

This document outlines best practices and technical guidance for building a system that converts natural language card effects into executable game logic using a Large Language Model (LLM), such as GPT-4.

## 🎯 Objective

Allow trading card game designers to write card rules in plain English, then use an LLM to generate engine-compatible scripts that implement the intended behavior.

---

## ✅ Core System Architecture

### 1. Scripting Language & Runtime

- Use a **safe, sandboxed scripting language** like **Lua** or **JavaScript (via Deno or V8 isolate)**.
- All game logic must route through engine-defined **API methods**.
  - Example methods:
    - `dealDamage(target, amount)`
    - `drawCards(player, count)`
    - `cast(card, options)`
    - `exile(card)`
    - `triggerWhen(eventType, callback)`
- Do **not** allow direct access to internal state.

---

### 2. Prompt Design for LLM

Create a structured prompt that:
- Defines the available functions and expected structure.
- Restricts output to only valid code inside a function body.
- Provides **examples** of correct input/output pairs.

**Prompt Example:**

```
You are generating Lua code for a digital card game engine.
Write only a single function using the following API:

Available Functions:
- dealDamage(target, amount)
- drawCards(player, count)
- exile(card)
- getAllPlayers()
- ...

Do not use any global variables.
Do not create new functions or call methods that aren’t listed.

Card effect: "When this enters the battlefield, exile the top card of each player's library. They may play it until end of turn."

Output:
function onEnterBattlefield(self)
  for _, player in pairs(getAllPlayers()) do
    local card = player:mill(1)[1]
    if card then
      player:grantTemporaryPlayPermission(card, { until = "endOfTurn" })
    end
  end
end
```

---

## 🧱 Script Handling Pipeline

1. **User Input**
   - Designer types card effect in natural language.
2. **Prompt Injection**
   - Format input using structured prompt template.
3. **LLM Generation**
   - Query model (e.g. GPT-4) for script output.
4. **Validation**
   - Check script for:
     - Only using allowed functions
     - No infinite loops
     - No disallowed global state
     - Syntax correctness
5. **Display Preview**
   - Show script to user (read-only or editable).
   - Option to manually adjust.
6. **Test Execution (Optional)**
   - Run script in a test environment to simulate common interactions.

---

## 🧠 Additional Features

- **Script Debugging Tools**
  - Log triggers and actions taken by the script.
  - Highlight which line caused runtime issues.
- **Error Feedback**
  - Inform users if the natural language input is too ambiguous.
  - Offer clarification prompts (e.g. "Do you want this to affect your opponent too?").
- **Template Snippets**
  - Offer common effects as reusable templates.
- **Manual Override**
  - Allow experienced users to edit the generated script directly.

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| LLM generates invalid or unsafe code | Strict prompt + API call whitelist + static analyzer |
| Ambiguous designer intent | AI feedback loop asking clarifying questions |
| Dependency on external LLM | Cache common prompts, allow fallback to templates |
| Complex cards still break system | Allow hand-written scripts as fallback (Tier 3 complexity) |

---

## 🧠 Summary

This system bridges the gap between powerful scripting and natural-language card design. By using an LLM to generate clean, validated code, you can empower non-coders to build rich, functional TCGs with ease.

Make scripting optional. Make natural language the default. Let power users go deeper.
