# Card Prefab Creation Guide

This guide will help you create a card prefab that works with the online artwork loading system we've implemented.

## Option 1: UI-Based Card (Canvas)

This option uses Unity's UI system for a 2D card that can be displayed in a Canvas.

### Step 1: Create the Basic Structure

1. Create a new GameObject called "CardTemplate"
2. Add a `RectTransform` component to it
3. Set Width to 250 and Height to 350 (standard card ratio)
4. Add a `Canvas` component to it
5. Add a `Canvas Scaler` component to it
6. Add a `Graphic Raycaster` component to it

### Step 2: Add the Card Background

1. Create a child UI Image GameObject named "Background"
2. Set its `RectTransform` to fill the entire card (anchors at 0,0,1,1)
3. Set its Image component color to your desired card background color
4. (Optional) Add a border or frame sprite to this image

### Step 3: Add Artwork Container

1. Create a child UI Image GameObject named "Artwork"
2. Set its `RectTransform` to be centered in the upper portion of the card
   - Position: X=0, Y=50
   - Width: 220, Height: 160
3. Leave the Image component's Source Image empty (it will be populated at runtime)

### Step 4: Add Text Elements

For TextMeshPro (recommended):
1. Add a child TextMeshPro Text GameObject named "NameText"
   - Position it at the top of the card
   - Set font size to 20
   - Set alignment to center
2. Add a child TextMeshPro Text GameObject named "CostText" 
   - Position it at the top-left corner
   - Set font size to 24
   - Set color to a distinct color
3. Add a child TextMeshPro Text GameObject named "AttackText"
   - Position it at the bottom-left corner
   - Set font size to 24
4. Add a child TextMeshPro Text GameObject named "HealthText"
   - Position it at the bottom-right corner
   - Set font size to 24
5. Add a child TextMeshPro Text GameObject named "DescriptionText"
   - Position it below the artwork
   - Set font size to 14
   - Set text alignment to center
   - Enable word wrapping

### Step 5: Add the Card Component

1. Add the `Card` script to the root CardTemplate GameObject
2. Connect the UI components in the Inspector:
   - Assign the "Artwork" Image to the artworkImage field
   - Assign the "NameText" TMPro to the nameText field
   - Assign the "CostText" TMPro to the costText field
   - Assign the "AttackText" TMPro to the attackText field
   - Assign the "HealthText" TMPro to the healthText field
   - Assign the "DescriptionText" TMPro to the descriptionText field

### Step 6: Create the Prefab

1. Drag the CardTemplate GameObject from the Hierarchy into the Project view
2. Save it as a prefab

## Option 2: 3D Card (World Space)

This option creates a 3D card model that can be placed in the game world.

### Step 1: Create the Basic Structure

1. Create a new GameObject called "CardTemplate3D"
2. Add a `Card` script component to it

### Step 2: Add Visual Elements

1. Create a child GameObject named "CardModel"
2. Add a `MeshFilter` component to it and set it to a Quad mesh
3. Add a `MeshRenderer` component to it
4. Create a new material for the card (using a shader that supports textures)

### Step 3: Add Artwork Renderer

1. Create a child GameObject named "Artwork"
2. Position it slightly in front of the card model (e.g. Z position = 0.01)
3. Scale it to cover most of the card face (e.g. X=0.8, Y=0.6, Z=1)
4. Add a `SpriteRenderer` component to it (leave Sprite empty)

### Step 4: Add World Space Canvas for Text

1. Create a child GameObject named "CardTextCanvas"
2. Add a `Canvas` component to it
3. Set the Canvas's Render Mode to "World Space"
4. Position it slightly in front of the card model (e.g. Z position = 0.02)
5. Scale the canvas to fit the card (e.g. X=0.01, Y=0.01, Z=0.01)
6. Add a `CanvasScaler` component to it
7. Add the text elements as child GameObjects with TextMeshProUGUI components:
   - "NameText" - positioned at the top
   - "CostText" - positioned at top-left 
   - "AttackText" - positioned at bottom-left
   - "HealthText" - positioned at bottom-right
   - "DescriptionText" - positioned in the middle-bottom

### Step 5: Connect Components to the Card Script

1. Select the root CardTemplate3D GameObject
2. In the Inspector, connect the components to the Card script:
   - Find the artworkImage field and leave it empty (we'll use SpriteRenderer instead)
   - Connect all TextMeshProUGUI components from the Canvas

### Step 6: Create the Prefab

1. Drag the CardTemplate3D GameObject from the Hierarchy into the Project view
2. Save it as a prefab

## Option 3: Simple Card for Testing

If you just want to test the system quickly:

### Step 1: Create a Simple Card

1. Create a new GameObject called "SimpleCard"
2. Add a `SpriteRenderer` component to it
   - Leave the Sprite field empty (will be filled at runtime)
3. Add the `Card` script component to it

### Step 2: Create the Prefab

1. Drag the SimpleCard GameObject from the Hierarchy into the Project view
2. Save it as a prefab

## Setting Up in the MainGame Script

1. Open your Unity project
2. Select your MainGame GameObject in the Hierarchy
3. In the Inspector, find the "Card Prefab" field
4. Drag your newly created card prefab from the Project view into this field

## Creating a CardImageLoader GameObject

For convenience, you can also create a dedicated CardImageLoader:

1. Create a new GameObject named "CardImageLoader"
2. Add the `CardImageLoader` script component to it
3. Make it a prefab if you want to reuse it across scenes

## Testing

1. Run your game
2. The cards should now load their artwork from the URL specified in the CardData
3. If you're using the UI components, they should display the card name, cost, attack, health, and description properly

## Troubleshooting

If the artwork doesn't load:
- Check the Console for error messages
- Verify that the URL is accessible and returns a valid image
- Make sure the CardImageLoader is in the scene
- Check that the Image or SpriteRenderer components exist with the names the code expects

If text doesn't display:
- Make sure your TextMeshPro elements are named correctly 
- Verify that the TextMeshProUGUI components are assigned in the Card script
- Check the Console for any errors related to text assignment