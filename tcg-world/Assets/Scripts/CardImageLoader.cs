using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Handles loading card images from remote URLs.
/// </summary>
public class CardImageLoader : MonoBehaviour
{
    // Singleton pattern
    public static CardImageLoader Instance { get; private set; }
    
    // Static dictionary to cache downloaded sprites to avoid re-downloading
    private Dictionary<string, Sprite> spriteCache = new Dictionary<string, Sprite>();
    
    private void Awake()
    {
        // Singleton setup
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
    }
    
    /// <summary>
    /// Loads a sprite from a URL. If the sprite is already cached, returns it immediately.
    /// Otherwise, starts a coroutine to download it.
    /// </summary>
    /// <param name="url">URL of the image to load</param>
    /// <param name="onComplete">Callback with the loaded sprite (can be null if loading fails)</param>
    public void LoadCardArt(string url, System.Action<Sprite> onComplete)
    {
        // Check if we've already downloaded this sprite
        if (spriteCache.ContainsKey(url))
        {
            onComplete?.Invoke(spriteCache[url]);
            return;
        }
        
        // Start the coroutine to download the image
        StartCoroutine(LoadCardArtCoroutine(url, onComplete));
    }
    
    /// <summary>
    /// Coroutine to load an image from a URL
    /// </summary>
    private IEnumerator LoadCardArtCoroutine(string url, System.Action<Sprite> onComplete)
    {
        using (UnityWebRequest webRequest = UnityWebRequestTexture.GetTexture(url))
        {
            // Send the request and wait for a response
            yield return webRequest.SendWebRequest();
            
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                // Create texture from downloaded data
                Texture2D texture = DownloadHandlerTexture.GetContent(webRequest);
                
                // Create sprite from texture
                Sprite sprite = Sprite.Create(
                    texture, 
                    new Rect(0, 0, texture.width, texture.height),
                    new Vector2(0.5f, 0.5f)
                );
                
                // Cache the sprite
                spriteCache[url] = sprite;
                
                // Return the sprite through the callback
                onComplete?.Invoke(sprite);
            }
            else
            {
                Debug.LogError($"Error downloading image from {url}: {webRequest.error}");
                onComplete?.Invoke(null);
            }
        }
    }
    
    /// <summary>
    /// Clears the sprite cache to free up memory
    /// </summary>
    public void ClearCache()
    {
        spriteCache.Clear();
    }
}