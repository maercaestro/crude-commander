import { useState } from 'react';
import Popup from './Popup';

const Ship = ({ src, name, position, size, rotation = 0, data }) => {
  const [showPopup, setShowPopup] = useState(false);

  const shipData = {
    'Current Inventory': data?.currentInventory || '0 bbl',
    'Available Capacity': data?.availableCapacity || '0 bbl',
    'Destination': data?.destination || 'Not Set'
  };

  return (
    <>
      <img 
        src={src}
        alt={name}
        className="absolute -translate-x-1/2 -translate-y-1/2 hover:cursor-pointer 
                   transition-transform duration-200 hover:scale-105"
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`,
          width: `${size}px`,
          transform: `rotate(${rotation}deg)`,
          imageRendering: 'pixelated',
          zIndex: showPopup ? 20 : 10
        }}
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
        draggable="false"
      />
      {showPopup && (
        <div 
          className="absolute"
          style={{ 
            left: `${position.x}%`, 
            top: `${position.y}%`, 
            transform: 'translate(-50%, -120%)',
            zIndex: 30
          }}
        >
          <Popup
            title={name}
            data={shipData}
          />
        </div>
      )}
    </>
  );
};

export default Ship;