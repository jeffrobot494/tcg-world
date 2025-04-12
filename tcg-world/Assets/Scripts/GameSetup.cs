using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Ensures that all required game components are initialized.
/// Attach this to a GameObject in the scene.
/// </summary>
public class GameSetup : MonoBehaviour
{
    void Awake()
    {
        // Ensure all singleton components are created
        EnsureComponent<MainGame>();
        EnsureComponent<GameRulesInterpreter>();
        EnsureComponent<InputManager>();
        // GameUI removed - no longer using 2D UI
        EnsureComponent<PlayerDeckManager>();
        // CardVisualFixer removed - using SimpleCard prefab as-is
        EnsureComponent<PhysicsSetup>();
        
        // Make sure the camera is properly positioned and configured
        SetupCamera();
    }
    
    // Configure the camera for proper interaction with cards
    private void SetupCamera()
    {
        Camera mainCamera = Camera.main;
        if (mainCamera != null)
        {
            // Ensure the camera can see all layers
            mainCamera.cullingMask = -1; // All layers
            
            Debug.Log("Camera configured for interaction");
        }
    }
    
    // Ensures that a component of type T exists in the scene
    private T EnsureComponent<T>() where T : MonoBehaviour
    {
        T component = FindObjectOfType<T>();
        
        if (component == null)
        {
            GameObject obj = new GameObject(typeof(T).Name);
            component = obj.AddComponent<T>();
            Debug.Log($"Created missing component: {typeof(T).Name}");
        }
        
        return component;
    }
}
