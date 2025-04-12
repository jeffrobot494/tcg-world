using UnityEngine;

/// <summary>
/// Handles the visual representation of cards, making them flat on the X,Z plane
/// </summary>
public class CardVisuals : MonoBehaviour
{
    [Tooltip("The size of the card in Unity units (width)")]
    public float cardWidth = 1f;
    
    [Tooltip("The size of the card in Unity units (length)")]
    public float cardLength = 1.4f;
    
    [Tooltip("The thickness of the card")]
    public float cardThickness = 0.1f;
    
    [Tooltip("The card front material")]
    public Material frontMaterial;
    
    [Tooltip("The card back material")]
    public Material backMaterial;
    
    private MeshRenderer meshRenderer;
    private Card cardComponent;
    
    void Awake()
    {
        // This component is now optional - the SimpleCard prefab can work without it
        // Only perform mesh setup if this component is explicitly added to a card
        
        // Get card component first to check if we should proceed
        cardComponent = GetComponent<Card>();
        if (cardComponent == null)
        {
            Debug.LogWarning("CardVisuals script requires a Card component - disabling");
            enabled = false;
            return;
        }
        
        // Check if this card already has visuals (e.g., SpriteRenderer from prefab)
        SpriteRenderer existingRenderer = GetComponent<SpriteRenderer>();
        if (existingRenderer != null)
        {
            // Card already has visuals, so don't create a mesh
            Debug.Log($"Card {cardComponent.cardName} already has a SpriteRenderer - CardVisuals will only handle artwork updates");
            return;
        }
        
        // Only proceed with mesh creation if we're explicitly told to via inspector
        // or if there are no other visual components
        Debug.Log($"Creating mesh visuals for card {cardComponent.cardName} - this is not needed if using SimpleCard prefab");
        
        // Create the card mesh
        Mesh cardMesh = CreateCardMesh();
        
        // Add mesh components for visual representation
        MeshFilter meshFilter = GetComponent<MeshFilter>();
        if (meshFilter == null)
        {
            meshFilter = gameObject.AddComponent<MeshFilter>();
            meshFilter.mesh = cardMesh;
        }
        else if (meshFilter.mesh == null)
        {
            meshFilter.mesh = cardMesh;
        }
        
        meshRenderer = GetComponent<MeshRenderer>();
        if (meshRenderer == null)
        {
            meshRenderer = gameObject.AddComponent<MeshRenderer>();
        }
        
        // Card component was already retrieved above
        if (cardComponent == null)
        {
            Debug.LogError("CardVisuals script requires a Card component");
        }
        
        // Set up default materials if none assigned
        if (frontMaterial == null)
        {
            // Use a more distinct material for the front
            frontMaterial = new Material(Shader.Find("Standard"));
            frontMaterial.color = new Color(1f, 1f, 1f, 1f);
            // Add a small amount of emission to make it more visible
            frontMaterial.EnableKeyword("_EMISSION");
            frontMaterial.SetColor("_EmissionColor", new Color(0.2f, 0.2f, 0.2f));
        }
        
        if (backMaterial == null)
        {
            // Use a more distinct material for the back
            backMaterial = new Material(Shader.Find("Standard"));
            backMaterial.color = new Color(0.2f, 0.2f, 0.8f, 1f);
            // Add a small amount of emission to make it more visible
            backMaterial.EnableKeyword("_EMISSION");
            backMaterial.SetColor("_EmissionColor", new Color(0.1f, 0.1f, 0.3f));
        }
        
        // Initialize card visual state
        UpdateCardVisuals();
        
        Debug.Log($"CardVisuals initialized for card: {cardComponent?.cardName}");
    }
    
    // Create a simple mesh for the card that is flat on the X,Z plane
    private Mesh CreateCardMesh()
    {
        Mesh mesh = new Mesh();
        
        // Define the vertices (X,Z plane with Y as height)
        // Counter-clockwise winding for front face
        Vector3[] vertices = new Vector3[]
        {
            // Front face
            new Vector3(-cardWidth/2, 0, -cardLength/2),          // Bottom left
            new Vector3(-cardWidth/2, 0, cardLength/2),           // Top left
            new Vector3(cardWidth/2, 0, cardLength/2),            // Top right
            new Vector3(cardWidth/2, 0, -cardLength/2),           // Bottom right
            
            // Back face
            new Vector3(-cardWidth/2, -cardThickness, -cardLength/2),  // Bottom left
            new Vector3(-cardWidth/2, -cardThickness, cardLength/2),   // Top left
            new Vector3(cardWidth/2, -cardThickness, cardLength/2),    // Top right
            new Vector3(cardWidth/2, -cardThickness, -cardLength/2)    // Bottom right
        };
        
        // Define triangles (2 per face, 6 faces total)
        int[] triangles = new int[]
        {
            // Front face
            0, 1, 2,
            0, 2, 3,
            
            // Back face
            7, 6, 5,
            7, 5, 4,
            
            // Left edge
            4, 5, 1,
            4, 1, 0,
            
            // Right edge
            3, 2, 6,
            3, 6, 7,
            
            // Top edge
            1, 5, 6,
            1, 6, 2,
            
            // Bottom edge
            4, 0, 3,
            4, 3, 7
        };
        
        // Define UVs (simplified - just for front and back faces)
        Vector2[] uvs = new Vector2[]
        {
            // Front face
            new Vector2(0, 0),
            new Vector2(0, 1),
            new Vector2(1, 1),
            new Vector2(1, 0),
            
            // Back face
            new Vector2(0, 0),
            new Vector2(0, 1),
            new Vector2(1, 1),
            new Vector2(1, 0)
        };
        
        mesh.vertices = vertices;
        mesh.triangles = triangles;
        mesh.uv = uvs;
        mesh.RecalculateNormals();
        
        return mesh;
    }
    
    // Update visuals based on card state
    private void UpdateCardVisuals()
    {
        if (cardComponent == null) return;
        
        // Check for SpriteRenderer first (used by SimpleCard prefab)
        SpriteRenderer spriteRenderer = GetComponent<SpriteRenderer>();
        if (spriteRenderer != null)
        {
            // For cards with SpriteRenderer, just set the sprite
            if (cardComponent.isFaceUp && cardComponent.artwork != null)
            {
                spriteRenderer.sprite = cardComponent.artwork;
            }
            // Could add a card back sprite here if needed
            return;
        }
        
        // Only proceed with mesh renderer updates if we're actually using a mesh
        if (meshRenderer == null) return;
        
        // Set material based on face-up or face-down state
        if (cardComponent.isFaceUp)
        {
            meshRenderer.material = frontMaterial;
            
            // If card has artwork and we have a material with a main texture
            if (cardComponent.artwork != null && frontMaterial.HasProperty("_MainTex"))
            {
                // Create a new texture from the sprite
                Texture2D tex = new Texture2D(
                    (int)cardComponent.artwork.rect.width,
                    (int)cardComponent.artwork.rect.height,
                    TextureFormat.RGBA32,
                    false);
                
                Color[] pixels = cardComponent.artwork.texture.GetPixels(
                    (int)cardComponent.artwork.rect.x,
                    (int)cardComponent.artwork.rect.y,
                    (int)cardComponent.artwork.rect.width,
                    (int)cardComponent.artwork.rect.height);
                
                tex.SetPixels(pixels);
                tex.Apply();
                
                // Apply the texture to the material
                frontMaterial.mainTexture = tex;
            }
        }
        else
        {
            meshRenderer.material = backMaterial;
        }
    }
    
    // Called when card visuals need to be updated
    public void RefreshVisuals()
    {
        UpdateCardVisuals();
    }
}
