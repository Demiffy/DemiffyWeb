export interface CarData {
    id: number;
    name: string;
    price: string;
    images: string[];
    description: string;
    features: {
      [key: number]: string[];
    };
    modelYears: {
      [key: number]: {
        power: string;
        torque: string;
        acceleration: string;
        topSpeed: string;
        fuelEconomy: string;
        weight: string;
      };
    };
    commonIssues: {
      [key: number]: string[];
    };
    purchaseLinks: {
      name: string;
      url: string;
    }[];
  }
  
  export const corvetteC5Data: CarData = {
    id: 1,
    name: "Chevrolet Corvette C5",
    price: "€18,000 - €30,000",
    images: [
        "/carImages/corvetteC5/c5front.png",
        "/carImages/corvetteC5/c5back.png",
        "/carImages/corvetteC5/c5side.png",
        "/carImages/corvetteC5/c5interior.png",
        "/carImages/corvetteC5/c5engine.png",
    ],
    description:
      "The Chevrolet Corvette C5, produced from 1997 to 2004, marked a significant leap in the Corvette's evolution with its LS1 and LS6 V8 engines, hydroformed box frame, and rear-mounted transaxle for improved handling. The C5 introduced features such as Active Handling System and Head-Up Display, and it was the last Corvette to feature pop-up headlights.",
    features: {
      1997: ["LS1 5.7L V8 engine", "Rear-wheel drive", "6-speed manual or 4-speed automatic transmission"],
      1998: ["Convertible model introduced", "Active Handling System (optional)", "First Corvette convertible with a trunk since 1962"],
      1999: ["Fixed Roof Coupe (FRC)", "Standard Active Handling System", "LS1 5.7L V8 engine"],
      2000: ["Z51 Performance Package", "Improved interior materials", "LS1 5.7L V8 engine", "Active Handling System"],
      2001: ["Z06 model introduced", "LS6 5.7L V8 engine", "Active Handling System (standard)", "50-50 weight distribution"],
      2002: ["405 PS Z06 model with LS6 V8", "Magnetic Selective Ride Control Suspension"],
      2003: ["50th Anniversary Edition", "Magnetic Selective Ride Control Suspension", "Head-Up Display"],
      2004: ["Le Mans Commemorative Edition", "Carbon fiber hood for Z06", "LS6 5.7L V8 engine", "Magnetic Selective Ride Control Suspension", "Z06 model"],
    },
    modelYears: {
      1997: {
        power: "345 PS @ 5,600 rpm",
        torque: "483 Nm @ 4,200 rpm",
        acceleration: "4.7 seconds (0-100 km/h)",
        topSpeed: "282 km/h",
        fuelEconomy: "12.8 L/100 km (combined)",
        weight: "1,459 kg",
      },
      1998: {
        power: "345 PS @ 5,600 rpm",
        torque: "483 Nm @ 4,200 rpm",
        acceleration: "4.6 seconds (0-100 km/h)",
        topSpeed: "282 km/h",
        fuelEconomy: "12.8 L/100 km (combined)",
        weight: "1,472 kg",
      },
      1999: {
        power: "345 PS @ 5,600 rpm",
        torque: "483 Nm @ 4,200 rpm",
        acceleration: "4.6 seconds (0-100 km/h)",
        topSpeed: "282 km/h",
        fuelEconomy: "12.8 L/100 km (combined)",
        weight: "1,472 kg",
      },
      2000: {
        power: "345 PS @ 5,600 rpm",
        torque: "483 Nm @ 4,200 rpm",
        acceleration: "4.6 seconds (0-100 km/h)",
        topSpeed: "282 km/h",
        fuelEconomy: "12.8 L/100 km (combined)",
        weight: "1,472 kg",
      },
      2001: {
        power: "350 PS @ 5,600 rpm (base) / 385 PS @ 6,000 rpm (Z06)",
        torque: "488 Nm @ 4,400 rpm (base) / 522 Nm @ 4,800 rpm (Z06)",
        acceleration: "4.5 seconds (0-100 km/h, base) / 4.0 seconds (Z06)",
        topSpeed: "282 km/h (base) / 274 km/h (Z06)",
        fuelEconomy: "12.8 L/100 km (combined)",
        weight: "1,472 kg (base) / 1,414 kg (Z06)",
      },
      2002: {
        power: "350 PS @ 5,600 rpm (base) / 405 PS @ 6,000 rpm (Z06)",
        torque: "488 Nm @ 4,400 rpm (base) / 542 Nm @ 4,800 rpm (Z06)",
        acceleration: "4.5 seconds (0-100 km/h, base) / 3.9 seconds (Z06)",
        topSpeed: "282 km/h (base) / 275 km/h (Z06)",
        fuelEconomy: "12.8 L/100 km (combined)",
        weight: "1,472 kg (base) / 1,414 kg (Z06)",
      },
      2003: {
        power: "350 PS @ 5,600 rpm (base) / 405 PS @ 6,000 rpm (Z06)",
        torque: "488 Nm @ 4,400 rpm (base) / 542 Nm @ 4,800 rpm (Z06)",
        acceleration: "4.5 seconds (0-100 km/h, base) / 3.9 seconds (Z06)",
        topSpeed: "282 km/h (base) / 275 km/h (Z06)",
        fuelEconomy: "12.8 L/100 km (combined)",
        weight: "1,472 kg (base) / 1,414 kg (Z06)",
      },
      2004: {
        power: "350 PS @ 5,600 rpm (base) / 405 PS @ 6,000 rpm (Z06)",
        torque: "488 Nm @ 4,400 rpm (base) / 542 Nm @ 4,800 rpm (Z06)",
        acceleration: "4.5 seconds (0-100 km/h, base) / 3.9 seconds (Z06)",
        topSpeed: "282 km/h (base) / 275 km/h (Z06)",
        fuelEconomy: "12.8 L/100 km (combined)",
        weight: "1,472 kg (base) / 1,414 kg (Z06)",
      },
    },
    commonIssues: {
      1997: ["Steering column lock failure", "Fuel pump module failure"],
      1998: ["Fuel tank level sensor failure", "Electronic Braking Control Module (EBCM) failure", "Steering column lock failure"],
      1999: ["Hazard switch failure", "Steering column lock issues", "Fuel tank level sensor failure"],
      2000: ["Valve spring breakage", "Fuel pump module failure", "Hazard switch failure", "Steering column lock issues"],
      2001: ["Valve spring failure (Z06)", "Fuel pump module issues", "Hazard switch failure", "Steering column lock issues"],
      2002: ["Valve spring breakage (Z06)", "Hazard switch failure", "EBCM failure", "Steering column lock issues"],
      2003: ["EBCM module failure", "Fuel tank level sensor issues", "Steering column lock issues", "Valve spring breakage (Z06)"],
      2004: ["Carbon fiber hood cracking (Z06)", "Fuel pump issues", "EBCM module failure", "Steering column lock issues"],
    },
    purchaseLinks: [
      { name: "AutoScout24", url: "https://www.autoscout24.com/lst/corvette/c5" },
      { name: "Mobile.de", url: "https://suchen.mobile.de/fahrzeuge/search.html?isSearchRequest=true&ms=%3B%3B%3Bcorvette-c5&refId=0d781cdd-998a-1eac-17dd-89bfdbb1b651&s=Car&sb=rel&vc=Car" },
    ],
  };

  export const lancerEvoXData: CarData = {
    id: 2,
    name: "Mitsubishi Lancer Evolution X",
    price: "€35,000 - €45,000",
    images: [
        "/carImages/lancerEvoX/evoxfront.png",
        "/carImages/lancerEvoX/evoxback.png",
        "/carImages/lancerEvoX/evoxside.png",
        "/carImages/lancerEvoX/evoxinterior.png",
        "/carImages/lancerEvoX/evoxengine.png",
    ],
    description:
      "The Mitsubishi Lancer Evolution X, produced from 2007 to 2016, is the final generation of the Lancer Evolution. It features a turbocharged 2.0L inline-4 engine, advanced all-wheel-drive system (S-AWC), and aggressive styling. Known for its rally heritage, the Evo X offers thrilling performance with its high-output engine and precise handling.",
    features: {
      2008: ["2.0L turbocharged inline-4 engine", "5-speed manual transmission", "All-wheel drive (S-AWC)"],
      2009: ["Optional 6-speed Twin-Clutch SST", "Upgraded suspension", "BBS wheels"],
      2010: ["Bilstein shock absorbers", "Brembo brakes", "Recaro seats"],
      2011: ["Upgraded interior materials", "Premium audio system", "Keyless entry"],
      2012: ["Final Edition features", "Black roof", "Unique badging"],
    },
    modelYears: {
      2008: {
        power: "295 PS @ 6,500 rpm",
        torque: "366 Nm @ 3,500 rpm",
        acceleration: "5.4 seconds (0-100 km/h)",
        topSpeed: "240 km/h",
        fuelEconomy: "10.2 L/100 km (combined)",
        weight: "1,560 kg",
      },
      2009: {
        power: "295 PS @ 6,500 rpm",
        torque: "366 Nm @ 3,500 rpm",
        acceleration: "5.4 seconds (0-100 km/h)",
        topSpeed: "240 km/h",
        fuelEconomy: "10.2 L/100 km (combined)",
        weight: "1,560 kg",
      },
      2010: {
        power: "295 PS @ 6,500 rpm",
        torque: "366 Nm @ 3,500 rpm",
        acceleration: "5.4 seconds (0-100 km/h)",
        topSpeed: "240 km/h",
        fuelEconomy: "10.2 L/100 km (combined)",
        weight: "1,560 kg",
      },
      2011: {
        power: "295 PS @ 6,500 rpm",
        torque: "366 Nm @ 3,500 rpm",
        acceleration: "5.4 seconds (0-100 km/h)",
        topSpeed: "240 km/h",
        fuelEconomy: "10.2 L/100 km (combined)",
        weight: "1,560 kg",
      },
      2012: {
        power: "303 PS @ 6,500 rpm",
        torque: "414 Nm @ 3,500 rpm",
        acceleration: "5.0 seconds (0-100 km/h)",
        topSpeed: "240 km/h",
        fuelEconomy: "10.2 L/100 km (combined)",
        weight: "1,600 kg",
      },
    },
    commonIssues: {
      2008: ["Turbocharger wear", "Clutch wear", "Transmission issues (SST)"],
      2009: ["Turbocharger wear", "Clutch wear", "Transmission issues (SST)"],
      2010: ["Transmission issues (SST)", "Suspension wear", "Clutch wear"],
      2011: ["Clutch wear", "Suspension wear", "Engine oil consumption"],
      2012: ["Engine oil consumption", "Turbocharger wear", "Clutch wear"],
    },
    purchaseLinks: [
      { name: "AutoScout24", url: "https://www.autoscout24.com/lst/mitsubishi/lancer/ve_evo" },
      { name: "Mobile.de", url: "https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=%3B%3B%3BMitsubishi+evo+x&s=Car&sb=rel&vc=Car" },
    ],
  };
  
  
  export const carData: CarData[] = [corvetteC5Data, lancerEvoXData];