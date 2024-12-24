// fnaf.tsx
import React from "react";
import {
  rooms,
  Room,
  doors,
  Door,
  hallways,
  Hallway,
  Animatronic,
} from "../data/fnafrooms";
import { useFNAFLogic } from "../utils/fnafLogic";

const CELL_SIZE = 60;
const GRID_PADDING = 20;

// BatteryIndicator Component
const BatteryIndicator: React.FC<{ battery: number }> = ({ battery }) => (
  <div className="absolute top-12 right-4 w-32">
    <div className="mb-1 text-white font-semibold">
      Battery: {battery.toFixed(1)}%
    </div>
    <div className="w-full bg-gray-300 rounded-full h-4">
      <div
        className={`h-4 rounded-full ${
          battery > 50
            ? "bg-green-500"
            : battery > 20
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
        style={{ width: `${battery}%` }}
      ></div>
    </div>
  </div>
);

// LogScreen Component
const LogScreen: React.FC<{ logs: string[] }> = ({ logs }) => {
  const logEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="absolute top-12 left-4 w-64 h-96 bg-gray-800 bg-opacity-75 rounded-lg p-4 overflow-y-auto shadow-lg">
      <h2 className="text-white text-lg font-semibold mb-2">Action Log</h2>
      <ul className="space-y-1">
        {logs.map((log, index) => (
          <li key={index} className="text-gray-200 text-sm">
            {log}
          </li>
        ))}
        <div ref={logEndRef} />
      </ul>
    </div>
  );
};

// RoomComponent
const RoomComponent: React.FC<{
  room: Room;
  minRow: number;
  minCol: number;
  animatronicsInRoom: Animatronic[];
}> = ({ room, minRow, minCol, animatronicsInRoom }) => {
  const actualRowStart =
    Math.min(room.rowStart, room.rowEnd || room.rowStart) - minRow + 1;
  const actualRowEnd =
    Math.max(room.rowStart, room.rowEnd || room.rowStart) - minRow + 1;
  const actualColStart =
    Math.min(room.colStart, room.colEnd || room.colStart) - minCol + 1;
  const actualColEnd =
    Math.max(room.colStart, room.colEnd || room.colStart) - minCol + 1;

  return (
    <div
      className="relative box-border border-2 border-blue-500 bg-blue-100 rounded-md flex items-center justify-center shadow-lg text-sm font-semibold text-gray-800 text-center overflow-hidden"
      style={{
        gridRow: `${actualRowStart} / ${actualRowEnd}`,
        gridColumn: `${actualColStart} / ${actualColEnd}`,
        padding: "4px",
      }}
      title={room.name}
      aria-label={room.name}
    >
      <span className="px-2">{room.name}</span>
      {/* Render Animatronics in normal mode */}
      {animatronicsInRoom.map((animatronic, index) => {
        const offsetX = (index % 3) * 25; // Horizontal offset
        const offsetY = Math.floor(index / 3) * 8; // Vertical offset

        return (
          <div
            key={animatronic.id}
            className="absolute bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            title={animatronic.name}
            aria-label={animatronic.name}
            style={{
              width: "20px",
              height: "20px",
              top: `${offsetY + 2}px`,
              left: `${offsetX + 2}px`,
              zIndex: 3,
            }}
          >
            {animatronic.name.charAt(0)}
          </div>
        );
      })}
    </div>
  );
};

// DoorComponent with Animatronic Icon Overlay and Timer
const DoorComponent: React.FC<{
  door: Door;
  minRow: number;
  minCol: number;
  isClosed: boolean;
  toggleDoor: (id: string) => void;
  disabled: boolean;
  addLog: (message: string) => void;
  animatronicsAttacking: Animatronic[];
}> = ({
  door,
  minRow,
  minCol,
  isClosed,
  toggleDoor,
  disabled,
  addLog,
  animatronicsAttacking,
}) => {
  const baseTop = (door.rowStart - minRow) * CELL_SIZE;
  const baseLeft = (door.colStart - minCol) * CELL_SIZE;

  const DOOR_WIDTH = 10;
  const DOOR_HEIGHT = 20;

  const handleToggleDoor = React.useCallback(() => {
    if (!disabled) {
      toggleDoor(door.id);
      addLog(
        `${door.name} door ${!isClosed ? "closed" : "opened"} by player`
      );
    }
  }, [disabled, toggleDoor, door.id, door.name, isClosed, addLog]);

  const handleKeyPress = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        handleToggleDoor();
      }
    },
    [disabled, handleToggleDoor]
  );

  // Calculate exact position for Animatronics attacking this door
  const animatronicIcons = animatronicsAttacking.map((animatronic, index) => {
    const angle = (index / animatronicsAttacking.length) * 360;
    const radius = 12;
    const radians = (angle * Math.PI) / 180;
    const offsetX = radius * Math.cos(radians);
    const offsetY = radius * Math.sin(radians);

    return (
      <div
        key={animatronic.id}
        className="absolute bg-red-500 text-white text-xs rounded-full flex items-center justify-center flex-col"
        title={`${animatronic.name} in attack mode`}
        aria-label={`${animatronic.name} in attack mode`}
        style={{
          width: "30px",
          height: "30px",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`,
          zIndex: 4,
        }}
      >
        <span>{animatronic.name.charAt(0)}</span>
        {/* Timer Display */}
        {animatronic.timeRemaining !== undefined && (
          <span className="text-xs text-yellow-300">
            {animatronic.timeRemaining}s
          </span>
        )}
      </div>
    );
  });

  return (
    <div
      onClick={handleToggleDoor}
      onKeyPress={handleKeyPress}
      tabIndex={disabled ? -1 : 0}
      className={`relative border-2 rounded-sm flex items-center justify-center shadow-md text-xs font-semibold text-gray-800 text-center cursor-pointer hover:bg-opacity-80 transition-colors ${
        isClosed
          ? "border-red-500 bg-red-500"
          : "border-green-500 bg-green-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      style={{
        top: `${baseTop - DOOR_HEIGHT / 2 + CELL_SIZE / 2}px`,
        left: `${baseLeft - DOOR_WIDTH / 2 + CELL_SIZE / 2}px`,
        width: `${DOOR_WIDTH}px`,
        height: `${DOOR_HEIGHT}px`,
        zIndex: 2,
      }}
      title={`${door.name} (${isClosed ? "Closed" : "Open"})`}
      aria-label={`${door.name} door is ${isClosed ? "closed" : "open"}`}
    >
      {/* Render Animatronics Attacking this Door */}
      {animatronicIcons}
    </div>
  );
};

// HallwayComponent
const HallwayComponent: React.FC<{
  hallway: Hallway;
  minRow: number;
  minCol: number;
}> = ({ hallway, minRow, minCol }) => {
  const actualRowStart =
    Math.min(hallway.rowStart, hallway.rowEnd || hallway.rowStart) -
    minRow +
    1;
  const actualRowEnd =
    Math.max(hallway.rowStart, hallway.rowEnd || hallway.rowStart) -
    minRow +
    1;
  const actualColStart =
    Math.min(hallway.colStart, hallway.colEnd || hallway.colStart) -
    minCol +
    1;
  const actualColEnd =
    Math.max(hallway.colStart, hallway.colEnd || hallway.colStart) -
    minCol +
    1;

  const isHorizontal = hallway.orientation === "horizontal";

  const spanRows = actualRowEnd - actualRowStart + 1;
  const spanCols = actualColEnd - actualColStart + 1;

  const baseTop = (actualRowStart - 1) * CELL_SIZE;
  const baseLeft = (actualColStart - 1) * CELL_SIZE;

  const offsetTop = hallway.offsetY ? hallway.offsetY * CELL_SIZE : 0;
  const offsetLeft = hallway.offsetX ? hallway.offsetX * CELL_SIZE : 0;

  const startOffsetPx = hallway.startOffset ? hallway.startOffset * CELL_SIZE : 0;
  const endOffsetPx = hallway.endOffset ? hallway.endOffset * CELL_SIZE : 0;

  const HALLWAY_THICKNESS = CELL_SIZE / 4;

  const width = isHorizontal
    ? spanCols * CELL_SIZE - startOffsetPx - endOffsetPx
    : HALLWAY_THICKNESS;
  const height = isHorizontal
    ? HALLWAY_THICKNESS
    : spanRows * CELL_SIZE - startOffsetPx - endOffsetPx;

  const top = isHorizontal
    ? baseTop + offsetTop + startOffsetPx
    : baseTop + offsetTop + startOffsetPx;
  const left = isHorizontal
    ? baseLeft + offsetLeft + startOffsetPx
    : baseLeft + offsetLeft + startOffsetPx;

  return (
    <div
      className="absolute bg-white shadow-lg"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: "2px solid #3B81F5",
        zIndex: 1,
      }}
      aria-label={`Hallway ${hallway.id}`}
    ></div>
  );
};

// BlackoutOverlay Component
const BlackoutOverlay: React.FC<{ phase: number }> = ({ phase }) => (
  <div
    className={`fixed top-0 left-0 w-full h-full bg-black transition-opacity duration-1000 ${
      phase === 1
        ? "opacity-50"
        : phase === 2
        ? "opacity-75"
        : "opacity-100"
    }`}
    style={{ zIndex: 100 }}
    aria-hidden="true"
  ></div>
);

// YouDiedOverlay Component
const YouDiedOverlay: React.FC = () => (
  <div
    className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center"
    style={{ zIndex: 200 }}
    role="alertdialog"
    aria-labelledby="you-died-title"
    aria-describedby="you-died-description"
  >
    <div
      className="text-white text-4xl font-bold animate-pulse"
      id="you-died-title"
    >
      You died
    </div>
  </div>
);

// HourCounter Component
const HourCounter: React.FC<{ currentHour: number }> = ({ currentHour }) => {
  // Convert 24-hour format to 12-hour format with AM/PM
  const hour12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
  const amPm = currentHour < 12 || currentHour === 24 ? "AM" : "PM";

  return (
    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-32">
      <div className="mb-1 text-white font-semibold text-center">
        Time: {hour12}:00 {amPm}
      </div>
      <div className="w-full bg-gray-300 rounded-full h-4">
        <div
          className="h-4 rounded-full bg-blue-500"
          style={{
            width: `${Math.min((currentHour / 6) * 100, 100)}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

const FNAF: React.FC = () => {
  const {
    doorStates,
    toggleDoor,
    battery,
    gameState,
    logs,
    currentHour,
    animatronics,
    addLog,
    minRow,
    minCol,
    gridRows,
    gridCols,
  } = useFNAFLogic();

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center p-4 relative">
      {/* Battery Indicator */}
      <BatteryIndicator battery={battery} />

      {/* Log Screen */}
      <LogScreen logs={logs} />

      {/* Hour Counter */}
      <HourCounter currentHour={currentHour} />

      <div
        className="relative bg-gray-800 gap-2 rounded-lg shadow-2xl overflow-hidden box-border"
        style={{
          width: `${gridCols * CELL_SIZE + 2 * GRID_PADDING}px`,
          height: `${gridRows * CELL_SIZE + 2 * GRID_PADDING}px`,
          display: "grid",
          gridTemplateRows: `repeat(${gridRows}, ${CELL_SIZE}px)`,
          gridTemplateColumns: `repeat(${gridCols}, ${CELL_SIZE}px)`,
          padding: `${GRID_PADDING}px`,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Render Hallways */}
        {hallways.map((hallway) => (
          <HallwayComponent
            key={hallway.id}
            hallway={hallway}
            minRow={minRow}
            minCol={minCol}
          />
        ))}

        {/* Render Rooms */}
        {rooms.map((room) => {
          const animatronicsInRoom = animatronics.filter(
            (animatronic) => animatronic.currentRoomId === room.id && animatronic.mode === "normal"
          );
          return (
            <RoomComponent
              key={room.id}
              room={room}
              minRow={minRow}
              minCol={minCol}
              animatronicsInRoom={animatronicsInRoom}
            />
          );
        })}

        {/* Render Doors */}
        {doors.map((door) => {
          // Find animatronics attacking this door
          const animatronicsAttacking = animatronics.filter(
            (animatronic) =>
              animatronic.mode === "attack" &&
              animatronic.attackingDoorId === door.id
          );

          return (
            <DoorComponent
              key={door.id}
              door={door}
              minRow={minRow}
              minCol={minCol}
              isClosed={doorStates[door.id]}
              toggleDoor={toggleDoor}
              disabled={gameState !== "normal"}
              addLog={addLog}
              animatronicsAttacking={animatronicsAttacking}
            />
          );
        })}
      </div>

      {/* Blackout Overlays */}
      {gameState === "blackout1" && <BlackoutOverlay phase={1} />}
      {gameState === "blackout2" && <BlackoutOverlay phase={2} />}

      {/* You Died Overlay */}
      {gameState === "dead" && <YouDiedOverlay />}
    </div>
  );
};

export default FNAF;