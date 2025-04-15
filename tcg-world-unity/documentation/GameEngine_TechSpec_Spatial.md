# Game-Agnostic Card Engine – Technical Specification (Updated with Spatial Support)

## 🎯 Objective

Design and implement a general-purpose, game-agnostic digital card engine capable of supporting any card game—from simple games like Go Fish to complex trading card games like Magic: The Gathering or grid-based strategy games. The engine must be fully configurable at runtime through JSON, with behavior extended via scripts (or LLM-generated code), without modifying the engine code.

---

## 🧱 Core Concepts

### 1. Entity System

All objects in the game are represented as `Entity` objects. These include cards, players, zones, grid cells, and more.

```json
{
  "id": "entity_1",
  "type": "card",
  "tags": ["creature", "blue"],
  "state": {
    "power": 3,
    "toughness": 2,
    "tapped": false
  },
  "relationships": ["zone_1", "player_1"],
  "position": { "x": 1, "y": 2 },
  "coordinateSystem": "grid2d"
}
```

---

## 🌐 Coordinate System Support (Spatial Integration)

The engine supports flexible spatial systems via `coordinateSystem` and `position` fields.

### Coordinate System Definition

```json
{
  "id": "hex3d",
  "dimensions": ["x", "y", "z"],
  "adjacency": "hexagonal_3d",
  "renderHints": "project_iso"
}
```

These systems define movement, adjacency, rendering behavior, and coordinate interpretation.

### Entity Positioning

Each entity may have:

- `position`: object with coordinates appropriate for its system
- `coordinateSystem`: reference to a defined coordinate system
- Optional: `layer`, `orientation`, `subzone`, or other spatial metadata

### Queries and Movement

Engine must support spatial queries such as:

- `getEntitiesInRadius(entity, radius)`
- `getAdjacentEntities(entity)`
- `getEntitiesOnLayer("deck2")`

These enable grid movement, range checks, and area effects across any dimension.

---

## ⚙️ Engine Responsibilities

### 1. State Management

- Track all entities and relationships
- Support dynamic creation, mutation, and deletion
- Persist/restore game states

### 2. Rule Execution System

- Run game rules as **scripts** triggered by **events**
- Built-in event types:
  - `onMove(entity, fromZone, toZone)`
  - `onEnterZone(card, zone)`
  - `onTurnStart(player)`
  - `onWinCheck()`
  - `onMove3D`, `onEnterHex`

### 3. Query System

Spatial and logical:
- `getEntitiesByTag("creature")`
- `getZoneContents("hand_p1")`
- `getAdjacentZones("tile_3_4")`
- `getEntitiesInArea(center, radius, system)`

---

## 🧩 Scripting Layer

```lua
function onEnterZone(self, zone)
  if zone:hasTag("crystal") and zone:inRadius(self, 2) then
    self:addState("energized", true)
  end
end

function onStartTurn(player)
  local units = engine:getAdjacentEntities(player:getHero())
  for _, u in ipairs(units) do
    if u:hasTag("enemy") then
      u:takeDamage(1)
    end
  end
end
```

---

## 🤖 LLM Integration

### Input:
> "Each unit can move up to 3 tiles on a hex grid. When they end movement next to an enemy, they deal 1 damage."

### Output:
- Coordinate system: `hex3d`
- Position fields on units
- Script:
```lua
function onEndMovement(self)
  local enemies = engine:getAdjacentEntities(self)
  for _, e in ipairs(enemies) do
    if e:hasTag("enemy") then
      e:takeDamage(1)
    end
  end
end
```

---

## 🧪 Spatial Game Example: Hex-Grid Tactical Card Game

### Coordinate System
```json
{
  "id": "hex3d",
  "dimensions": ["q", "r", "s"],
  "adjacency": "hex",
  "renderHints": "hexagonal"
}
```

### Example Unit Entity
```json
{
  "id": "unit_001",
  "type": "card",
  "tags": ["unit", "melee"],
  "state": { "hp": 5, "moveRange": 3 },
  "position": { "q": 0, "r": -1, "s": 1 },
  "coordinateSystem": "hex3d"
}
```

### Script: Auto-Attack on Adjacency
```lua
function onMove(self)
  local targets = engine:getAdjacentEntities(self)
  for _, t in ipairs(targets) do
    if t:hasTag("enemy") then
      t:takeDamage(1)
    end
  end
end
```

---

## 🔐 Security and Sandboxing

- Scripts run in sandbox
- Only access engine API
- Rate limited, timeout protected
- Validated before deployment

---

## 🧠 Summary

This hybrid model now supports:

- Declarative game logic via structured entities
- Rich spatial modeling (grids, hexes, 3D, etc.)
- Behavior scripting for edge cases and custom rules
- LLM generation for both structure and logic
- AI opponents, dynamic rulesets, and future-proof extensions

It's a single system capable of supporting everything from Go Fish to hex-grid wargames—with or without code.
