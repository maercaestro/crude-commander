import React from 'react';


const DockingStation = ({ position, isVisible = true, name = '' }) => {
  return (
    <div 
      className="absolute hover:cursor-pointer transition-opacity duration-200"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        width: '15px',
        height: '15px',
        backgroundColor: 'orange',
        transform: 'translate(-50%, -50%)',
        opacity: isVisible ? 1 : 0,
        zIndex: 15
      }}
      title={name}
    />
  );
};

// Export both the component and the configuration
export default DockingStation;