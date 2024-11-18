export type Room = {
    id: string;
    name: string;
    rowStart: number;
    rowEnd?: number;
    colStart: number;
    colEnd?: number;
    moveto?: string[];
  };  

  export type Door = {
    id: string;
    name: string;
    rowStart: number;
    colStart: number;
    rowEnd?: number;
    colEnd?: number;
    offsetX?: number;
    offsetY?: number;
  };

  export type Hallway = {
    id: string;
    orientation: 'horizontal' | 'vertical';
    rowStart: number;
    colStart: number;
    rowEnd?: number;
    colEnd?: number;
    offsetX?: number;
    offsetY?: number;
    startOffset?: number;
    endOffset?: number;
  };

  export type Animatronic = {
    id: string;
    name: string;
    currentRoomId: string;
    mode: "normal" | "attack";
    attackingDoorId?: string;
    timeRemaining?: number;
  };
  

  export const rooms: Room[] = [
    {
      id: "kitchen",
      name: "Kitchen",
      rowStart: 5,
      rowEnd: 6,
      colStart: 3,
      moveto: ["dining_area"],
    },
    {
      id: "dining_area",
      name: "Dining Area",
      rowStart: 8,
      rowEnd: 5,
      colStart: 4,
      colEnd: 10,
      moveto: ["kitchen", "stage", "check_in", "closet", "service_room", "right_hall", "left_hall"],
    },
    {
        id: "stage",
        name: "Stage",
        rowStart: 5,
        rowEnd: 4,
        colStart: 6,
        colEnd: 8,
        moveto: ["dining_area"],
    },
    {
        id: "check_in",
        name: "Check-In",
        rowStart: 8,
        rowEnd: 6,
        colStart: 11,
        colEnd: 10,
        moveto: ["dining_area", "entrance"],
    },
    {
        id: "entrance",
        name: "Entrance",
        rowStart: 8,
        rowEnd: 7,
        colStart: 13,
        colEnd: 11,
        moveto: ["check_in"],
    },
    {
      id: "closet",
      name: "Supply Closet",
      rowStart: 7,
      rowEnd: 8,
      colStart: 3,
      moveto: ["dining_area"],
    },
    {
      id: "left_hall",
      name: "Left Hall",
      rowStart: 12,
      rowEnd: 8,
      colStart: 5,
      moveto: ["security_room", "bathroom"],
    },
    {
      id: "security_room",
      name: "Security Room",
      rowStart: 12,
      rowEnd: 10,
      colStart: 8,
      colEnd: 6,
    },
    {
      id: "right_hall",
      name: "Right Hall",
      rowStart: 12,
      rowEnd: 8,
      colStart: 8,
      moveto: ["security_room"],
    },
    {
        id: "bathroom",
        name: "Bathroom",
        rowStart: 8,
        rowEnd: 10,
        colStart: 4,
        moveto: ["left_hall"],
    },
    {
        id: "service_room",
        name: "Service Room",
        rowStart: 8,
        rowEnd: 9,
        colStart: 9,
        colEnd: 11,
        moveto: ["dining_area"],
    },
  ];

  export const doors: Door[] = [
    {
      id: "door_security_left",
      name: "Security-Left Hall Door",
      rowStart: 12,
      colStart: 6,
      offsetX: .2,
      offsetY: 0,
    },
    {
      id: "door_security_right",
      name: "Security-Right Hall Door",
      rowStart: 12,
      colStart: 7,
      offsetX: .0,
      offsetY: 0,
    },
  ];

  export const hallways: Hallway[] = [
    {
      id: "H_hallway_right",
      orientation: "vertical",
      rowStart: 9,
      rowEnd: 9,
      colStart: 9,
      colEnd: 9,
      offsetX: .38,
      offsetY: -.265,
      startOffset: 0,
      endOffset: 0.866,
    },
    {
      id: "H_hallway_left",
      orientation: "vertical",
      rowStart: 9,
      colStart: 6,
      colEnd: 6,
      offsetX: -.03,
      offsetY: -.265,
      startOffset: 0,
      endOffset: 0.866,
    },
  ];

  export const animatronics: Animatronic[] = [
    {
      id: "animatronic1",
      name: "Freddy",
      currentRoomId: "stage",
      mode: "normal",
    },
    {
      id: "animatronic2",
      name: "Bonnie",
      currentRoomId: "stage",
      mode: "normal",
    },
    {
      id: "animatronic3",
      name: "Chica",
      currentRoomId: "stage",
      mode: "normal",
    },
    {
      id: "animatronic4",
      name: "Foxy",
      currentRoomId: "dining_area",
      mode: "normal",
    },
  ];