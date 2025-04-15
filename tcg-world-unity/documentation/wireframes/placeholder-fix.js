// Script to handle missing images by adding placeholder boxes
document.addEventListener('DOMContentLoaded', function() {
    // Create placeholder text for broken images
    Array.from(document.querySelectorAll('img')).forEach(img => {
        img.onerror = function() {
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.backgroundColor = '#2c3e50';
            this.style.color = '#ecf0f1';
            this.style.fontSize = '14px';
            this.style.padding = '10px';
            this.style.border = '2px dashed #7f8c8d';
            this.style.borderRadius = '5px';
            this.style.minHeight = '40px';
            this.style.minWidth = '40px';
            this.style.maxWidth = '100%';
            this.style.textAlign = 'center';
            
            // Set the image src to a transparent pixel to prevent repeated error
            this.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            
            // Add text node with the placeholder message
            const textNode = document.createElement('span');
            textNode.textContent = 'Placeholder Image';
            textNode.style.position = 'absolute';
            textNode.style.top = '50%';
            textNode.style.left = '50%';
            textNode.style.transform = 'translate(-50%, -50%)';
            textNode.style.fontWeight = 'bold';
            textNode.style.textAlign = 'center';
            textNode.style.width = '90%';
            
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.display = 'inline-block';
            container.style.minWidth = this.width + 'px';
            container.style.minHeight = this.height + 'px';
            container.style.backgroundColor = '#2c3e50';
            container.style.border = '2px dashed #7f8c8d';
            container.style.borderRadius = '5px';
            
            // Replace the img with the container
            this.parentNode.insertBefore(container, this);
            container.appendChild(textNode);
            this.remove();
        };
    });
});