export const calculateNewPosition = (currentPos, destinationPos, speed = 2, offset = 0) => {
  // Calculate the direction vector
  const dx = destinationPos.x - currentPos.x;
  const dy = destinationPos.y - currentPos.y;
  
  // Calculate the distance
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // If ship is very close to destination (within speed+offset), 
  // return the destination adjusted by the offset along the direction vector.
  if (distance < speed + offset) {
    // When near the destination, subtract offset along the normalized direction.
    return {
      x: destinationPos.x - (dx / distance) * offset,
      y: destinationPos.y - (dy / distance) * offset,
      rotation: (Math.atan2(dy, dx) * 180 / Math.PI + 90) % 360
    };
  }
  
  // Otherwise, move the ship along the direction by speed
  const newX = currentPos.x + (dx / distance) * speed;
  const newY = currentPos.y + (dy / distance) * speed;
  
  const rotation = (Math.atan2(dy, dx) * 180 / Math.PI + 90) % 360;
  
  return {
    x: newX,
    y: newY,
    rotation
  };
};