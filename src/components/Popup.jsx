const Popup = ({ title, data, position }) => {
  return (
    <div 
      className="bg-gray-800/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg"
      style={{
        position: 'absolute',
        left: position?.x + '%',
        top: position?.y + '%',
        transform: 'translate(-50%, -120%)',
        minWidth: '300px',
        zIndex: 50
      }}
    >
      <h3 className="text-xl font-bold mb-3 border-b border-gray-600 pb-2">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-300">{key}:</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Popup;