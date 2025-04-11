# CardImageLoader Class

## Overview
The `CardImageLoader` class is responsible for loading card artwork from remote URLs. It acts as a centralized service for downloading and caching card images, ensuring that artwork is only downloaded once even if used on multiple cards.

## Key Properties

### Singleton Access
- **Instance**: Static property to access the single instance of the loader

### Internal Storage
- **spriteCache**: Dictionary that stores downloaded images, indexed by URL

## Key Methods

### Image Loading
- **LoadCardArt(string url, Action<Sprite> onComplete)**: Primary method for requesting an image, takes a URL and a callback that receives the loaded Sprite
- **LoadCardArtCoroutine(...)**: Internal coroutine that performs the actual download
- **ClearCache()**: Clears the cached images to free up memory

## How This Class Interacts with Others

- **Card**: Card objects request artwork through this loader
- **PlayerDeckManager**: Uses the loader when creating cards from card data

## Implementation Details

This class uses Unity's `UnityWebRequest` system to download images from the internet. It converts the downloaded textures into Unity Sprite objects that can be directly used by card renderers.

The singleton pattern ensures there's only one instance of the CardImageLoader in the scene, making it easy to access from anywhere in the code.

## Best Practices

- The caching system automatically prevents redundant downloads, improving performance
- Callback design allows for asynchronous loading without blocking the game
- Error handling ensures the game continues even if some images fail to load
- Memory management through the ClearCache method when images are no longer needed

## Example Usage

When a card needs artwork, typically the workflow is:

1. The PlayerDeckManager creates a card with a URL for its artwork
2. The card requests the artwork from CardImageLoader
3. The CardImageLoader checks if the image is cached
   - If cached, it returns it immediately
   - If not cached, it downloads the image and caches it
4. When loading completes, the callback updates the card's appearance

This system allows for efficient loading of card artwork even when dealing with large collections of cards, ensuring the game runs smoothly while still allowing for rich visual content.
