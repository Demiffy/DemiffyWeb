// utils/fnafLogic.tsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  rooms,
  doors,
  hallways,
  animatronics as initialAnimatronics,
  Animatronic,
} from "../data/fnafrooms";

// Helper function to get room by door id
const getRoomByDoorId = (doorId: string): string | undefined => {
  switch (doorId) {
    case "door_security_left":
      return "left_hall";
    case "door_security_right":
      return "right_hall";
    default:
      return undefined;
  }
};

// Function to format hour for display
const formatHour = (hour: number): string => {
  const hourInDay = hour % 24;
  const hour12 = hourInDay % 12 === 0 ? 12 : hourInDay % 12;
  const amPm = hourInDay < 12 || hourInDay === 24 ? "AM" : "PM";
  return `${hour12}:00 ${amPm}`;
};

// Define the possible game states
type GameState = "normal" | "blackout1" | "blackout2" | "dead";

// Custom Hook for FNAF Game Logic
export const useFNAFLogic = () => {
  // Initialize door states: true = closed, false = open
  const initialDoorStates = useMemo(() => {
    const states: { [key: string]: boolean } = {};
    doors.forEach((door) => {
      states[door.id] = false; // All doors start as open
    });
    return states;
  }, []);

  const [doorStates, setDoorStates] = useState<{ [key: string]: boolean }>(
    initialDoorStates
  );
  const [battery, setBattery] = useState<number>(100);

  // Game states: 'normal', 'blackout1', 'blackout2', 'dead'
  const [gameState, setGameState] = useState<GameState>("normal");

  // Action Logs
  const [logs, setLogs] = useState<string[]>([]);

  // Hour Counter
  const [currentHour, setCurrentHour] = useState<number>(0);

  // Animatronics State
  const [animatronics, setAnimatronics] = useState<Animatronic[]>(
    initialAnimatronics
  );

  // Refs to store timers to prevent them from being cleared prematurely
  const blackout1TimerRef = useRef<NodeJS.Timeout | null>(null);
  const blackout2TimerRef = useRef<NodeJS.Timeout | null>(null);
  const hourTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State to track rooms under attack
  const [roomsUnderAttack, setRoomsUnderAttack] = useState<{ [roomId: string]: boolean }>({});

  // Function to add a log entry
  const addLog = useCallback((message: string) => {
    setLogs((prevLogs) => {
      const newLogs = [
        ...prevLogs,
        `${new Date().toLocaleTimeString()}: ${message}`,
      ];
      if (newLogs.length > 100) {
        newLogs.shift();
      }
      return newLogs;
    });
  }, []);

  // Function to toggle door state
  const toggleDoor = useCallback((id: string) => {
    setDoorStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Battery drain logic
  useEffect(() => {
    if (gameState !== "normal") return;

    const interval = setInterval(() => {
      setBattery((prev) => {
        if (prev <= 0) return 0;

        // Base drain rate: ~0.277% per second for 6 minutes total
        let drain = 0.277;

        // Additional drain for each closed door
        const closedDoors = Object.values(doorStates).filter(
          (closed) => closed
        ).length;
        drain += closedDoors * 0.277;

        const newBattery = Math.max(prev - drain, 0);
        return newBattery;
      });
    }, 1000); // Drain every second

    return () => clearInterval(interval);
  }, [doorStates, gameState]);

  // Blackout and game over logic
  useEffect(() => {
    if (battery > 0 || gameState !== "normal") return;

    addLog("Battery depleted! Opening all doors and initiating blackout.");

    // Open all doors
    const allOpenDoors = Object.keys(doorStates).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as { [key: string]: boolean });
    setDoorStates(allOpenDoors);

    // Start blackout sequence
    setGameState("blackout1");
    addLog("Blackout Phase 1 started.");

    // Timer for first blackout phase (5 seconds)
    blackout1TimerRef.current = setTimeout(() => {
      setGameState("blackout2");
      addLog("Blackout Phase 2 started.");
    }, 5000);

    // Timer for second blackout phase (additional 5 seconds)
    blackout2TimerRef.current = setTimeout(() => {
      setGameState("dead");
      addLog("Player died.");
    }, 10000);

    return () => {
      if (blackout1TimerRef.current) {
        clearTimeout(blackout1TimerRef.current);
      }
      if (blackout2TimerRef.current) {
        clearTimeout(blackout2TimerRef.current);
      }
    };
  }, [battery, gameState, doorStates, addLog]);

  // Hour counter logic
  useEffect(() => {
    hourTimerRef.current = setInterval(() => {
      setCurrentHour((prev) => {
        const nextHour = prev + 1;
        addLog(`Time advanced to ${formatHour(nextHour)}.`);
        return nextHour;
      });
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(hourTimerRef.current!);
  }, [addLog]);

  useEffect(() => {
    if (gameState === "dead" && hourTimerRef.current) {
      clearInterval(hourTimerRef.current);
    }
  }, [gameState]);

  // Animatronics movement logic
  useEffect(() => {
    if (gameState !== "normal") return;

    const movementInterval = setInterval(() => {
      setAnimatronics((prevAnimatronics) => {
        const updatedAnimatronics = prevAnimatronics.map((animatronic) => {
          const currentRoom = rooms.find(
            (room) => room.id === animatronic.currentRoomId
          );
          if (!currentRoom || !currentRoom.moveto || currentRoom.moveto.length === 0) {
            // No movement possible
            return animatronic;
          }

          // Check if animatronic should engage attack mode
          if (
            animatronic.mode === "normal" &&
            (currentRoom.id === "left_hall" || currentRoom.id === "right_hall")
          ) {
            // Determine attacking door
            const attackingDoorId =
              currentRoom.id === "left_hall"
                ? "door_security_left"
                : "door_security_right";

            // Check if the room is already under attack
            if (!roomsUnderAttack[currentRoom.id]) {
              // Engage attack mode
              addLog(`${animatronic.name} is engaging attack mode towards ${attackingDoorId}.`);
              setRoomsUnderAttack((prev) => ({
                ...prev,
                [currentRoom.id]: true,
              }));
              return {
                ...animatronic,
                mode: "attack" as const,
                attackingDoorId: attackingDoorId,
                timeRemaining: 5,
              };
            } else {
              return animatronic;
            }
          }

          if (animatronic.mode === "attack") {
            return animatronic;
          }

          // Choose a random room from moveto
          const nextRoomId =
            currentRoom.moveto[
              Math.floor(Math.random() * currentRoom.moveto.length)
            ];
          const nextRoom = rooms.find((room) => room.id === nextRoomId);
          const nextRoomName = nextRoom ? nextRoom.name : nextRoomId;

          addLog(`${animatronic.name} moved from ${currentRoom.name} to ${nextRoomName}.`);

          return {
            ...animatronic,
            currentRoomId: nextRoomId,
          };
        });

        return updatedAnimatronics;
      });
    }, 5000); // Move every 5 seconds

    return () => clearInterval(movementInterval);
  }, [gameState, rooms, roomsUnderAttack, addLog]);

  // Attack timer logic
  useEffect(() => {
    if (gameState !== "normal") return;

    const timer = setInterval(() => {
      setAnimatronics((prevAnimatronics) =>
        prevAnimatronics.map((animatronic) => {
          if (animatronic.mode === "attack" && animatronic.timeRemaining !== undefined) {
            if (animatronic.timeRemaining > 1) {
              return {
                ...animatronic,
                timeRemaining: animatronic.timeRemaining - 1,
              };
            } else {
              // Time's up, finalize attack
              const doorId = animatronic.attackingDoorId;
              if (doorId && !doorStates[doorId]) {
                // Door is open, attack succeeds
                addLog(`${animatronic.name} has attacked! Moving to Security Room.`);
                setGameState("dead");
                addLog("Player died.");
              } else if (doorId && doorStates[doorId]) {
                // Door is closed, attack is thwarted
                addLog(`${animatronic.name}'s attack was thwarted.`);
                setRoomsUnderAttack((prev) => {
                  const roomId = getRoomByDoorId(doorId);
                  if (roomId) {
                    const updated = { ...prev };
                    delete updated[roomId];
                    return updated;
                  }
                  return prev;
                });
                return {
                  ...animatronic,
                  mode: "normal" as const,
                  attackingDoorId: undefined,
                  timeRemaining: undefined,
                };
              }
            }
          }
          return animatronic;
        })
      );
    }, 1000); // Tick every second

    return () => clearInterval(timer);
  }, [animatronics, doorStates, gameState, addLog]);

  // Collect all rows and columns to determine grid size
  const { minRow, maxRow, minCol, maxCol } = useMemo(() => {
    const allRows = [
      ...rooms.flatMap((room) => [room.rowStart, room.rowEnd || room.rowStart]),
      ...hallways.flatMap((hallway) => [hallway.rowStart, hallway.rowEnd || hallway.rowStart]),
    ];
    const allCols = [
      ...rooms.flatMap((room) => [room.colStart, room.colEnd || room.colStart]),
      ...hallways.flatMap((hallway) => [hallway.colStart, hallway.colEnd || hallway.colStart]),
    ];

    return {
      minRow: Math.min(...allRows),
      maxRow: Math.max(...allRows),
      minCol: Math.min(...allCols),
      maxCol: Math.max(...allCols),
    };
  }, [rooms, hallways]);

  const gridRows = maxRow - minRow + 1;
  const gridCols = maxCol - minCol + 1;

  return {
    doorStates,
    toggleDoor,
    battery,
    gameState,
    logs,
    currentHour,
    animatronics,
    roomsUnderAttack,
    addLog,
    formatHour,
    minRow,
    maxRow,
    minCol,
    maxCol,
    gridRows,
    gridCols,
  };
};