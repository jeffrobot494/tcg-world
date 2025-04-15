using UnityEngine;
using TCGWorld.Data;

namespace TCGWorld.View
{
    /// <summary>
    /// Visual representation of a zone in the game
    /// </summary>
    public class ZoneView : MonoBehaviour
    {
        [Header("Debug Visualization")]
        [SerializeField] private Color zoneColor = Color.blue;
        [SerializeField] private float opacity = 0.3f;
        
        // Reference to created zone plane
        private GameObject zonePlane;
        
        // Reference to zone data
        private ZoneData zoneData;
        
        /// <summary>
        /// Initialize with zone data
        /// </summary>
        public void Initialize(ZoneData data)
        {
            zoneData = data;
            
            // Update the GameObject name for clarity
            gameObject.name = $"Zone_{data.ZoneName}_{data.OwnerId}";
            
            // Create the visual representation
            CreateZonePlane();
            
            // Configure the zone visuals based on layout
            ApplyLayout();
            ApplyColor();
            
            Debug.Log($"ZoneView: Initialized view for zone {data.ZoneName}");
        }
        
        /// <summary>
        /// Create a quad for zone visualization
        /// </summary>
        private void CreateZonePlane()
        {
            // Create a new GameObject for the zone plane
            zonePlane = GameObject.CreatePrimitive(PrimitiveType.Quad);
            zonePlane.name = "ZonePlane";
            zonePlane.transform.SetParent(transform);
            
            // Initial setup - with default orientation (no local rotation)
            zonePlane.transform.localPosition = Vector3.zero;
            
            Debug.Log($"ZoneView: Created quad for zone {zoneData.ZoneName}");
        }
        
        /// <summary>
        /// Apply layout properties from zone definition
        /// </summary>
        private void ApplyLayout()
        {
            var layout = zoneData.Definition.Layout;
            
            // Apply position to the zone root
            transform.position = layout.Position.ToVector3();
            
            // Get layout rotation from JSON
            Vector3 layoutRotation = layout.Rotation.ToVector3();
            
            // First, apply the base rotation to lay flat on X/Z plane (looking up)
            // This establishes our "standard game orientation" where (0,0,0) in JSON means flat on table
            Quaternion baseOrientation = Quaternion.Euler(90f, 0f, 0f);
            
            // Then, apply any additional rotation specified in the layout
            // These are treated as deviations from the standard orientation
            Quaternion layoutRotationQuat = Quaternion.Euler(layoutRotation);
            
            // Combine the rotations (first base orientation, then layout rotation)
            transform.rotation = baseOrientation * layoutRotationQuat;
            
            // Apply size to zone plane
            if (zonePlane != null)
            {
                // Scale the quad appropriately for the game orientation
                zonePlane.transform.localScale = new Vector3(
                    layout.Size.X, // Width on X axis
                    layout.Size.Y, // Length on Z axis (after rotation)
                    1              // Default thickness (doesn't matter for quad)
                );
            }
            
            Debug.Log($"ZoneView: Applied layout to {zoneData.ZoneName} - " +
                     $"Position: {transform.position}, " +
                     $"Base Orientation: X/Z plane, " +
                     $"Layout Rotation: {layoutRotation}, " +
                     $"Final Rotation: {transform.rotation.eulerAngles}, " +
                     $"Size: {layout.Size.X}x{layout.Size.Y}");
        }
        
        /// <summary>
        /// Apply debug color to zone plane with guaranteed visibility
        /// </summary>
        private void ApplyColor()
        {
            if (zonePlane != null)
            {
                Renderer renderer = zonePlane.GetComponent<Renderer>();
                if (renderer != null)
                {
                    // Use a simple diffuse material that's guaranteed to be visible
                    Material material = new Material(Shader.Find("Diffuse"));
                    
                    // Set solid color (no transparency)
                    material.color = zoneColor;
                    
                    // Apply material
                    renderer.material = material;
                    
                    Debug.Log($"ZoneView: Applied solid color to {zoneData.ZoneName} using Diffuse shader");
                }
            }
        }
    }
}