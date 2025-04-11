using System;
using UnityEngine;

namespace TCGWorld.Utilities
{
    /// <summary>
    /// Generic singleton base class for non-MonoBehaviour classes.
    /// </summary>
    /// <typeparam name="T">Type of the singleton class</typeparam>
    public class Singleton<T> where T : class, new()
    {
        private static readonly object _lock = new object();
        private static T _instance;

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static T Instance
        {
            get
            {
                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = new T();
                        
                        // Call initialization if the class implements IInitializable
                        if (_instance is IInitializable initializable)
                        {
                            initializable.Initialize();
                        }
                    }
                    return _instance;
                }
            }
        }
    }

    /// <summary>
    /// Generic singleton base class for MonoBehaviour classes. 
    /// </summary>
    /// <typeparam name="T">Type of the singleton MonoBehaviour</typeparam>
    public abstract class SingletonBehaviour<T> : MonoBehaviour where T : MonoBehaviour
    {
        /// <summary>
        /// Whether the singleton should persist when loading a new scene.
        /// </summary>
        [Tooltip("If true, the object will not be destroyed when loading a new scene.")]
        [SerializeField] protected bool _dontDestroyOnLoad = false;

        /// <summary>
        /// Whether to log errors to the console when duplicate instances are found.
        /// </summary>
        [Tooltip("If true, will log errors when duplicate singletons are found.")]
        [SerializeField] protected bool _logErrors = true;

        private static T _instance;
        private static readonly object _lock = new object();
        private static bool _applicationIsQuitting = false;

        /// <summary>
        /// Gets the singleton instance.
        /// </summary>
        public static T Instance
        {
            get
            {
                if (_applicationIsQuitting)
                {
                    if (Application.isEditor)
                    {
                        // Reset the flag in editor to allow reuse during development
                        _applicationIsQuitting = false;
                    }
                    else
                    {
                        Debug.LogWarning($"[Singleton] Instance '{typeof(T)}' already destroyed on application quit. Returning null.");
                        return null;
                    }
                }

                lock (_lock)
                {
                    if (_instance == null)
                    {
                        // Search for existing instance
                        _instance = FindObjectOfType<T>();

                        // Create new instance if none exists
                        if (_instance == null)
                        {
                            GameObject singleton = new GameObject($"{typeof(T).Name} (Singleton)");
                            _instance = singleton.AddComponent<T>();
                            Debug.Log($"[Singleton] Created instance of {typeof(T).Name}");
                        }
                    }

                    return _instance;
                }
            }
        }

        /// <summary>
        /// Called when the script instance is being loaded.
        /// </summary>
        protected virtual void Awake()
        {
            if (_instance != null && _instance != this)
            {
                if (_logErrors)
                {
                    Debug.LogError($"[Singleton] Multiple instances of {typeof(T).Name} found. Destroying duplicate.");
                }
                Destroy(gameObject);
                return;
            }

            _instance = this as T;

            if (_dontDestroyOnLoad)
            {
                transform.SetParent(null);
                DontDestroyOnLoad(gameObject);
            }

            OnAwake();
        }

        /// <summary>
        /// Override this method for initialization instead of Awake.
        /// </summary>
        protected virtual void OnAwake() { }

        /// <summary>
        /// Called when the application is quitting.
        /// </summary>
        protected virtual void OnApplicationQuit()
        {
            _applicationIsQuitting = true;
        }

        /// <summary>
        /// Called when the MonoBehaviour will be destroyed.
        /// </summary>
        protected virtual void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }
    }

    /// <summary>
    /// Interface for initialization of singletons.
    /// </summary>
    public interface IInitializable
    {
        void Initialize();
    }
}