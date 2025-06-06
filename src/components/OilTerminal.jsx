import { useState } from 'react';
import Popup from './Popup';

const OilTerminal = ({ src, name, position, size, data }) => {
  const [showPopup, setShowPopup] = useState(false);

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
            data={data}
          />
        </div>
      )}
    </>
  );
};

export default OilTerminal;