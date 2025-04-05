export const isPointInsideEllipse = (point, center, width, height) => {
  const normalizedX = (point.x - center.x) / (width/2);
  const normalizedY = (point.y - center.y) / (height/2);
  return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
};

export const checkCollision = (newPosition, islands) => {
  for (const island of islands) {
    // Add a buffer around the island (10% larger than island size)
    const width = island.size * 1.1;
    const height = island.size * 1.1;
    
    if (isPointInsideEllipse(newPosition, island.position, width, height)) {
      return true; // Collision detected
    }
  }
  return false; // No collision
};