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
        // Make sure transform scale is 1,1,1 so mesh size isn't affected
        transform.localScale = Vector3.one;
        
        // Get or add mesh components for visual representation
        MeshFilter meshFilter = GetComponent<MeshFilter>();
        if (meshFilter == null)
        {
            meshFilter = gameObject.AddComponent<MeshFilter>();
            // Create a simple quad mesh for the card
            meshFilter.mesh = CreateCardMesh();
        }
        else if (meshFilter.mesh == null)
        {
            meshFilter.mesh = CreateCardMesh();
        }
        
        meshRenderer = GetComponent<MeshRenderer>();
        if (meshRenderer == null)
        {
            meshRenderer = gameObject.AddComponent<MeshRenderer>();
        }
        
        // Get the card component
        cardComponent = GetComponent<Card>();
        if (cardComponent == null)
        {
            Debug.LogError("CardVisuals script requires a Card component");
        }
        
        // Set up default materials if none assigned
        if (frontMaterial == null)
        {
            frontMaterial = new Material(Shader.Find("Standard"));
            frontMaterial.color = new Color(1f, 1f, 1f, 1f);
        }
        
        if (backMaterial == null)
        {
            backMaterial = new Material(Shader.Find("Standard"));
            backMaterial.color = new Color(0.2f, 0.2f, 0.8f, 1f);
        }
        
        // Initialize card visual state
        UpdateCardVisuals();
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
        if (cardComponent == null || meshRenderer == null) return;
        
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
