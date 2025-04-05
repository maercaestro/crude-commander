import React from 'react';

const BufferZone = ({ position, size, isVisible = false, offset = { x: 0, y: 0 } }) => {
  return (
    <div 
      className="absolute"
      style={{ 
        left: `${position.x + offset.x}%`, 
        top: `${position.y + offset.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -50%)',
        border: isVisible ? '2px dashed rgba(255, 0, 0, 0.5)' : 'none',
        borderRadius: '50%',
        backgroundColor: isVisible ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
        pointerEvents: 'none',
        zIndex: 5
      }}
    />
  );
};

export default BufferZone;