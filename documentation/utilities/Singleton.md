# Singleton Base Classes

## Overview

The `Singleton<T>` and `SingletonBehaviour<T>` classes provide a standardized implementation of the Singleton pattern for the TCG-World project. These base classes ensure consistent behavior across all singleton classes in the project, reducing code duplication and potential errors.

## Classes

### `Singleton<T>`

A generic singleton base class for non-MonoBehaviour classes.

#### Features:
- Thread-safe instance access
- Lazy initialization
- Support for optional initialization through the `IInitializable` interface

#### Usage:

```csharp
using TCGWorld.Utilities;

public class MyManager : Singleton<MyManager>, IInitializable
{
    // Your singleton class code here

    public void Initialize()
    {
        // Initialization code here
    }
}

// Access your singleton:
MyManager.Instance.DoSomething();
```

### `SingletonBehaviour<T>`

A generic singleton base class for MonoBehaviour classes.

#### Features:
- Configurable persistence between scenes using `DontDestroyOnLoad`
- Clear lifecycle management
- Customizable error reporting
- Protected initialization method

#### Inspector Options:
- **Don't Destroy On Load**: If checked, the singleton will persist when loading a new scene.
- **Log Errors**: If checked, will log errors when duplicate singletons are found.

#### Usage:

```csharp
using TCGWorld.Utilities;

public class MyGameManager : SingletonBehaviour<MyGameManager>
{
    // Your MonoBehaviour singleton code here

    protected override void OnAwake()
    {
        // Initialization code here (replaces Awake)
    }
}

// Access your singleton:
MyGameManager.Instance.DoSomething();
```

## Best Practices

1. **Choose the right base class**:
   - Use `Singleton<T>` for data-only classes that don't need MonoBehaviour features
   - Use `SingletonBehaviour<T>` for classes that need MonoBehaviour functionality

2. **Scene Persistence**:
   - Consider carefully whether your singleton should persist between scenes
   - Set the `_dontDestroyOnLoad` flag in the inspector or in your code

3. **Initialization Order**:
   - If singletons depend on each other, be careful about the order of access
   - Use the `OnAwake()` method for initialization in `SingletonBehaviour<T>`
   - Use the `Initialize()` method for initialization in `Singleton<T>`

4. **Avoid Circular Dependencies**:
   - Be careful not to create circular dependencies between singletons
   - If singleton A needs singleton B and vice versa, consider refactoring

5. **Testing**:
   - For unit testing, consider creating interfaces and dependency injection patterns

## Examples in the Project

The following classes in the TCG-World project use the singleton pattern:

1. **MainGame**: The central game controller
2. **PlayerDeckManager**: Manages player decks and card creation
3. **GameRulesInterpreter**: Loads and interprets game rules
4. **CardImageLoader**: Loads card images from URLs
