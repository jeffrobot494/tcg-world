using UnityEngine;

/// <summary>
/// Sets up the camera for a top-down view of the game board on the X,Z plane.
/// </summary>
public class CameraSetup : MonoBehaviour
{
    [Tooltip("Height of the camera above the X,Z plane")]
    public float cameraHeight = 12f;
    
    [Tooltip("Camera angle in degrees (90 = straight down)")]
    [Range(45f, 90f)]
    public float cameraAngle = 70f;
    
    [Tooltip("Camera field of view")]
    [Range(30f, 90f)]
    public float fieldOfView = 60f;
    
    [Tooltip("Should the camera look at a specific target point?")]
    public bool lookAtTarget = true;
    
    [Tooltip("Target point to look at if lookAtTarget is true")]
    public Vector3 targetPoint = Vector3.zero;
    
    // Reference to the camera component
    private Camera cam;
    
    void Awake()
    {
        cam = GetComponent<Camera>();
        if (cam == null)
        {
            cam = Camera.main;
            Debug.LogWarning("No camera component found on this object, using main camera.");
        }
        
        if (cam != null)
        {
            // Set camera field of view
            cam.fieldOfView = fieldOfView;
        }
        
        // Position and rotate the camera
        PositionCamera();
    }
    
    void PositionCamera()
    {
        // Calculate camera position based on height and angle
        float yPos = cameraHeight;
        float zOffset = cameraHeight * Mathf.Tan(Mathf.Deg2Rad * (90f - cameraAngle));
        
        // Position camera
        transform.position = new Vector3(0f, yPos, -zOffset);
        
        if (lookAtTarget)
        {
            // Look at target point
            transform.LookAt(targetPoint);
        }
        else
        {
            // Just set the rotation based on the angle
            transform.rotation = Quaternion.Euler(cameraAngle, 0f, 0f);
        }
    }
    
    // Optional: Add this to allow repositioning in the editor
    void OnValidate()
    {
        if (Application.isPlaying)
        {
            PositionCamera();
            
            if (cam != null)
            {
                cam.fieldOfView = fieldOfView;
            }
        }
    }
}
