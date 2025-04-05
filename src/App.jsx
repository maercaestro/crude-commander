import { useState, useRef, useEffect } from 'react'
import logo from './assets/logo-cc.png'
import island1 from './assets/island1.svg'
import island2 from './assets/island2.svg'
import island3 from './assets/island3.svg'
import oilTerminal from './assets/oil-terminal.svg'
import vlcc from './assets/vlcc.svg'
import mediumcc from './assets/mediumcc.svg'
import Island from './components/Island'
import OilTerminal from './components/OilTerminal'
import Ship from './components/Ship'
import DockingStation from './components/DockingStation'
import BufferZone from './components/BufferZone'
import TimeEngine from './timeEngine';
import { checkCollision } from './utils/collisionDetection';
import { 
  MapIcon, 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon, 
  ArrowRightCircleIcon, 
  Bars3Icon, 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  HandRaisedIcon
} from '@heroicons/react/24/solid'

const navIcons = {
  map: MapIcon,
  ops: BriefcaseIcon,
  economy: CurrencyDollarIcon,
  tracker: ChartBarIcon,
  logs: ClipboardDocumentListIcon,
  end: ArrowRightCircleIcon
}

const navItems = [
  { name: 'Map', key: 'map' },
  { name: 'Operations', key: 'ops' },
  { name: 'Economy', key: 'economy' },
  { name: 'Crude Tracker', key: 'tracker' },
  { name: 'Logs', key: 'logs' },
  { name: 'End Turn', key: 'end' },
];

// Add docking points configuration
const dockingPoints = [

  {
    position: { x: 88, y: 50 },
    isVisible: true,
    name: 'Calnera Capital Port'
  },
  {
    position: { x: 15, y: 32 },
    isVisible: true,
    name: 'Calnera East Port'
  },
  {
    position: { x: 48, y: 80 },
    isVisible: true,
    name: 'Calnera South Port'
  },

  // Add more docking points as needed
];

// First, add shipMovement utility
const calculateShipMovement = (ship, terminals, islands, speed = 2) => {
  if (!ship.data?.destination) {
    console.log(`Ship ${ship.name}: No destination set`);
    return ship;
  }
  
  const DOCK_BUFFER = 3;
  const AVOIDANCE_DISTANCE = 15;
  const AVOIDANCE_FORCE = 10;

  const getNextPosition = (start, end, speed) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < speed) {
      console.log(`Ship ${ship.name} reached destination`);
      return end;
    }

    // Calculate base movement
    let newX = start.x + (dx / distance) * speed;
    let newY = start.y + (dy / distance) * speed;

    // Check for buffer zone collisions and adjust course
    islands.forEach(island => {
      // Use buffer zone size instead of island size
      const bufferZoneRadius = island.size * 0.75 * 0.5; // Match the buffer zone size
      const obstacleX = island.position.x;
      const obstacleY = island.position.y + 10; // Account for buffer zone offset

      // Calculate distance to buffer zone
      const obstDx = newX - obstacleX;
      const obstDy = newY - obstacleY;
      const obstDistance = Math.sqrt(obstDx * obstDx + obstDy * obstDy);

      // If we're inside or too close to buffer zone, adjust course
      if (obstDistance < bufferZoneRadius + AVOIDANCE_DISTANCE) {
        console.log(`${ship.name}: Avoiding buffer zone of ${island.name}`);
        
        // Calculate avoidance vector
        const avoidX = -obstDy / obstDistance;
        const avoidY = obstDx / obstDistance;

        // Apply stronger avoidance force for buffer zones
        const avoidanceForce = (1 - (obstDistance / (bufferZoneRadius + AVOIDANCE_DISTANCE))) * AVOIDANCE_FORCE;
        newX += avoidX * avoidanceForce;
        newY += avoidY * avoidanceForce;
      }
    });

    return { x: newX, y: newY };
  };

  // Rest of the function remains the same
  const destinationTerminal = terminals.find(t => t.name === ship.data.destination);
  const destinationIsland = islands.find(i => i.name === ship.data.destination);
  
  if (destinationIsland) {
    const dockingPoint = dockingPoints.find(d => d.name.includes(destinationIsland.name));
    if (dockingPoint) {
      const nextPos = getNextPosition(ship.position, dockingPoint.position, speed);
      
      return {
        ...ship,
        position: nextPos,
        rotation: (Math.atan2(
          dockingPoint.position.y - ship.position.y,
          dockingPoint.position.x - ship.position.x
        ) * 180 / Math.PI + 90) % 360
      };
    }
  }

  const destination = destinationTerminal || destinationIsland;
  if (!destination) return ship;
  
  const nextPos = getNextPosition(ship.position, destination.position, speed);
  
  return {
    ...ship,
    position: nextPos,
    rotation: (Math.atan2(
      destination.position.y - ship.position.y,
      destination.position.x - ship.position.x
    ) * 180 / Math.PI + 90) % 360
  };
};

function App() {
  const [activeTab, setActiveTab] = useState('map')
  const [isNavOpen, setIsNavOpen] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentDay, setCurrentDay] = useState(1);
  const containerRef = useRef(null)

  const islands = [
    {
      src: island1,
      name: 'Calnera East',
      position: { x: 10, y: 30 },
      size: 200,
      data: {
        refineries: 2,
        terminals: 4,
        population: 1500000
      }
    },
    {
      src: island2,
      name: 'Calnera Capital',
      position: { x: 90, y: 0 },
      size: 700,
      data: {
        refineries: 3,
        terminals: 1,
        population: 3000000
      }
    },
    {
      src: island3,
      name: 'Calnera South',
      position: { x: 60, y: 70 },
      size: 500,
      data: {
        refineries: 1,
        terminals: 1,
        population: 800000
      }
    }
  ]

  const terminals = [
    {
      src: oilTerminal,
      name: 'Calnera East Terminal 1',
      position: { x: 15, y: 25 },
      size: 80,
      data: {
        'Production/Day': '10,000 bbl',
        'Inventory': '200,000 bbl'
      }
    },
    {
      src: oilTerminal,
      name: 'Calnera East Terminal 2',
      position: { x: 10, y: 50 },
      size: 80,
      data: {
        'Production/Day': '60,000 bbl',
        'Inventory': '1,000,000 bbl'
      }
    },
    {
      src: oilTerminal,
      name: 'Calnera East Terminal 3',
      position: { x: 25, y: 50 },
      size: 80,
      data: {
        'Production/Day': '50,000 bbl',
        'Inventory': '80,000 bbl'
      }
    },
    {
      src: oilTerminal,
      name: 'Calnera East Terminal 4',
      position: { x: 20, y: 40 },
      size: 80,
      data: {
        'Production/Day': '30,000 bbl',
        'Inventory': '400,000 bbl'
      }
    },
    {
      src: oilTerminal,
      name: 'Calnera South Terminal',
      position: { x: 45, y: 65 },
      size: 80,
      data: {
        'Production/Day': '5,000 bbl',
        'Inventory': '30,000 bbl'
      }
    },
    {
      src: oilTerminal,
      name: 'Deep Sea Terminal',
      position: { x: 50, y: 20 },
      size: 80,
      data: {
        'Production/Day': '200,000 bbl',
        'Inventory': '3,000,000 bbl'
      }
    }
  ]

  const [ships, setShips] = useState([
    // VLCCs
    {
      src: vlcc,
      name: 'VLCC Petromax',
      position: { x: 30, y: 40 },
      size: 50,
      rotation: 45,
      data: {
        currentInventory: '1,500,000 bbl',
        availableCapacity: '500,000 bbl',
        destination: 'Calnera East Terminal 2'
      }
    },
    {
      src: vlcc,
      name: 'VLCC Oceanking',
      position: { x: 60, y: 25 },
      size: 50,
      rotation: 315,
      data: {
        currentInventory: '800,000 bbl',
        availableCapacity: '1,200,000 bbl',
        destination: 'Calnera Capital'
      }
    },
    // Medium tankers
    {
      src: mediumcc,
      name: 'MT Seabridge',
      position: { x: 15, y: 45 },
      size: 30,
      rotation: 70,
      data: {
        currentInventory: '0 bbl',
        availableCapacity: '500,000 bbl',
        destination: 'Calnera East Terminal 1'
      }  // Heading east
    },
    {
      src: mediumcc,
      name: 'MT Starcruise',
      position: { x: 40, y: 60 },
      size: 30,
      rotation: 180,
      data: {
        currentInventory: '20,000 bbl',
        availableCapacity: '500,000 bbl',
        destination: 'Calnera South'
      } // Heading south
    },
    {
      src: mediumcc,
      name: 'MT Voyager',
      position: { x: 70, y: 55 },
      size: 30,
      rotation: 225,
      data: {
        currentInventory: '400,000 bbl',
        availableCapacity: '500,000 bbl',
        destination: 'Calnera South Terminal'
      }  // Heading southwest
    },
    {
      src: mediumcc,
      name: 'MT Navigator',
      position: { x: 55, y: 35 },
      size: 30,
      rotation: 0,
      data: {
        currentInventory: '10,000 bbl',
        availableCapacity: '500,000 bbl',
        destination: 'Calnera East Terminal 3'
      }  // Heading north
    }
  ]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleMouseDown = (e) => {
    if (!dragMode) return
    setIsDragging(true)
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Initialize engine
  const engine = useRef(new TimeEngine());

  // Advance time function
  const advanceTime = () => {
    const { newMonth, futureMonth } = engine.current.advanceMonth();
    
    // Update ship positions
    const updatedShips = engine.current.updateShipPositions(ships, terminals);
    setShips(updatedShips);
  };

  // Update the navItems click handler
  const handleNavClick = (key) => {
    if (key === 'end') {
      // Handle End Turn
      const updatedShips = ships.map(ship => 
        calculateShipMovement(ship, terminals, islands)
      );
      setShips(updatedShips);
      // Increment day counter
      setCurrentDay(prev => prev + 1);
    } else {
      setActiveTab(key);
    }
  };

  return (
    <div className="w-screen h-screen bg-sky-500 flex font-['Orbitron']">
      {/* Add day counter display near the top of the screen */}
      <div className="fixed top-4 right-1/2 transform translate-x-1/2 z-50 
                      bg-gray-800/80 text-white px-4 py-2 rounded-lg 
                      backdrop-blur-sm font-bold">
        Day: {currentDay}
      </div>

      {/* Toggle Button - Always visible */}
      <button 
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
      >
        <Bars3Icon className="w-6 h-6 text-gray-700" />
      </button>

      {/* Navigation Sidebar with transition */}
      <nav className={`
        fixed top-0 left-0 h-full bg-gray-200 p-4 flex flex-col gap-4
        transition-all duration-300 ease-in-out
        ${isNavOpen ? 'w-1/5 translate-x-0' : 'w-1/5 -translate-x-full'}
      `}>
        <div className="mb-8 mt-16">
          <img 
            src={logo}
            alt="Crude Commander Logo" 
            className="w-full max-w-[150px] mx-auto"
          />
        </div>
        
        {navItems.map((item) => {
          const Icon = navIcons[item.key]
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded
                ${activeTab === item.key 
                  ? 'bg-sky-600 text-gray-700' 
                  : 'text-gray-600 hover:bg-sky-700'}
                transition-colors duration-200
                text-left font-small tracking-wider
                border-2 border-gray-600
              `}
            >
              <Icon className="w-6 h-6" />
              {item.name}
            </button>
          )
        })}
      </nav>
      
      {/* Main Content Area with Zoom and Drag */}
      <main className={`
        transition-all duration-300 ease-in-out relative
        ${isNavOpen ? 'ml-[20%] w-[80%]' : 'w-full ml-0'}
      `}>
        {/* Control Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setDragMode(!dragMode)}
            className={`p-2 rounded-full transition-colors duration-200 
              ${dragMode 
                ? 'bg-sky-600 text-gray-700' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            <HandRaisedIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
          >
            <MagnifyingGlassPlusIcon className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
          >
            <MagnifyingGlassMinusIcon className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={advanceTime}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
          >
            Advance Month
          </button>
        </div>

        {/* Zoomable and Draggable Content */}
        <div 
          ref={containerRef}
          className={`w-full h-full overflow-hidden ${dragMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="w-full h-full"
            style={{
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
            }}
          >
            {/* Add buffer zones first */}
            {islands.map((island, index) => (
              <BufferZone
                key={`buffer-${index}`}
                position={island.position}
                size={island.size * 0.75}
                isVisible={true}
                offset={{ x: 0, y: 10 }} // Adjust these values to move the buffer zone
              />
            ))}
            
            {/* Add docking points */}
            {dockingPoints.map((point, index) => (
              <DockingStation
                key={`dock-${index}`}
                {...point}
              />
            ))}
            
            {islands.map((island, index) => (
              <Island
                key={`island-${index}`}
                {...island}
              />
            ))}
            {terminals.map((terminal, index) => (
              <OilTerminal
                key={`terminal-${index}`}
                {...terminal}
              />
            ))}
            {ships.map((ship, index) => (
              <Ship
                key={`ship-${index}`}
                {...ship}
              />
            ))}
            {dockingPoints.map((dockingPoint, index) => (
              <DockingStation
                key={`docking-${index}`}
                {...dockingPoint}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
