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
    id: 119972004,
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
    id: 220082012,
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
  
  export const ferrari348Data: CarData = {
    id: 319891993,
    name: "Ferrari 348",
    price: "€50,000 - €90,000",
    images: [
        "/carImages/ferrari348/348front.png"
    ],
    description:
      "The Ferrari 348, produced from 1989 to 1995, is a mid-engine V8 sports car known for its sharp handling and distinctive pop-up headlights. The 348 features a 3.4L V8 engine, rear-wheel drive, and the classic Ferrari styling with side strakes reminiscent of the Testarossa.",
    features: {
      1989: ["3.4L V8 engine", "5-speed manual transmission", "Pop-up headlights"],
      1990: ["Improved suspension system", "Revised interior", "Iconic Ferrari side strakes"],
      1991: ["Optional ABS brakes", "Enhanced aerodynamics", "Upgraded wheels"],
      1992: ["Motronic 2.7 engine management", "Increased horsepower", "Improved cooling"],
      1993: ["Speciale edition with weight reduction", "Performance suspension", "Enhanced braking system"],
    },
    modelYears: {
      1989: {
        power: "300 PS @ 7,200 rpm",
        torque: "324 Nm @ 4,200 rpm",
        acceleration: "5.6 seconds (0-100 km/h)",
        topSpeed: "275 km/h",
        fuelEconomy: "12.9 L/100 km (combined)",
        weight: "1,393 kg",
      },
      1990: {
        power: "300 PS @ 7,200 rpm",
        torque: "324 Nm @ 4,200 rpm",
        acceleration: "5.6 seconds (0-100 km/h)",
        topSpeed: "275 km/h",
        fuelEconomy: "12.9 L/100 km (combined)",
        weight: "1,393 kg",
      },
      1991: {
        power: "300 PS @ 7,200 rpm",
        torque: "324 Nm @ 4,200 rpm",
        acceleration: "5.6 seconds (0-100 km/h)",
        topSpeed: "275 km/h",
        fuelEconomy: "12.9 L/100 km (combined)",
        weight: "1,393 kg",
      },
      1992: {
        power: "320 PS @ 7,200 rpm",
        torque: "324 Nm @ 4,200 rpm",
        acceleration: "5.4 seconds (0-100 km/h)",
        topSpeed: "278 km/h",
        fuelEconomy: "12.9 L/100 km (combined)",
        weight: "1,393 kg",
      },
      1993: {
        power: "320 PS @ 7,200 rpm",
        torque: "324 Nm @ 4,200 rpm",
        acceleration: "5.4 seconds (0-100 km/h)",
        topSpeed: "278 km/h",
        fuelEconomy: "12.9 L/100 km (combined)",
        weight: "1,348 kg",
      },
    },
    commonIssues: {
      1989: ["Electrical system issues", "Cooling system problems", "Suspension wear"],
      1990: ["Electrical system issues", "Clutch wear", "Oil leaks"],
      1991: ["Cooling system problems", "Rust on body panels", "Engine oil consumption"],
      1992: ["Transmission sync issues", "Cooling system issues", "Oil consumption"],
      1993: ["Rust on body panels", "Suspension wear", "Electrical system issues"],
    },
    purchaseLinks: [
      { name: "AutoScout24", url: "https://www.autoscout24.com/lst/ferrari/348" },
      { name: "Mobile.de", url: "https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=%3B%3B%3BFerrari+348&s=Car&sb=rel&vc=Car" },
    ],
};

export const golf8TSIData: CarData = {
  id: 420102034,
  name: "Volkswagen Golf 8 TSI 1.0",
  price: "€20,000 - €30,000",
  images: [
    "/carImages/golf8TSI/front.jpg",
  ],
  description:
    "The Volkswagen Golf 8 TSI 1.0 is a compact hatchback that combines efficiency, performance, and modern technology. Powered by a turbocharged 1.0L TSI engine, it offers a balanced driving experience with excellent fuel economy and responsive handling. The Golf 8 features a sleek exterior design, a comfortable and tech-equipped interior, and advanced safety features, making it a popular choice in the compact car segment.",
  features: {
    2019: [
      "Turbocharged 1.0L TSI engine",
      "5-speed manual or 7-speed DSG transmission",
      "LED headlights",
      "Digital cockpit",
    ],
    2020: [
      "Added Apple CarPlay and Android Auto compatibility",
      "Enhanced infotainment system with larger touchscreen",
      "Adaptive Cruise Control (optional)",
    ],
    2021: [
      "Volkswagen Car-Net integration",
      "Wireless charging pad",
      "Upgraded interior materials",
      "Blind Spot Monitoring",
    ],
    2022: [
      "Introduction of Sportline trim",
      "Improved suspension for better handling",
      "Panoramic sunroof option",
      "LED matrix headlights",
    ],
    2023: [
      "Enhanced driver assistance systems",
      "Upgraded sound system options",
      "Wireless smartphone integration",
      "Eco mode for better fuel efficiency",
    ],
    2024: [
      "Hybrid variant introduction",
      "Augmented reality head-up display",
      "Advanced connectivity features",
      "Sustainably sourced interior materials",
    ],
  },
  modelYears: {
    2019: {
      power: "115 PS @ 4,800 rpm",
      torque: "200 Nm @ 1,500 - 4,000 rpm",
      acceleration: "9.0 seconds (0-100 km/h)",
      topSpeed: "204 km/h",
      fuelEconomy: "5.0 L/100 km (combined)",
      weight: "1,265 kg",
    },
    2020: {
      power: "115 PS @ 4,800 rpm",
      torque: "200 Nm @ 1,500 - 4,000 rpm",
      acceleration: "9.0 seconds (0-100 km/h)",
      topSpeed: "204 km/h",
      fuelEconomy: "5.0 L/100 km (combined)",
      weight: "1,275 kg",
    },
    2021: {
      power: "115 PS @ 4,800 rpm",
      torque: "200 Nm @ 1,500 - 4,000 rpm",
      acceleration: "9.0 seconds (0-100 km/h)",
      topSpeed: "204 km/h",
      fuelEconomy: "5.0 L/100 km (combined)",
      weight: "1,280 kg",
    },
    2022: {
      power: "115 PS @ 4,800 rpm",
      torque: "200 Nm @ 1,500 - 4,000 rpm",
      acceleration: "9.0 seconds (0-100 km/h)",
      topSpeed: "204 km/h",
      fuelEconomy: "4.9 L/100 km (combined)",
      weight: "1,290 kg",
    },
    2023: {
      power: "115 PS @ 4,800 rpm",
      torque: "200 Nm @ 1,500 - 4,000 rpm",
      acceleration: "8.8 seconds (0-100 km/h)",
      topSpeed: "206 km/h",
      fuelEconomy: "4.8 L/100 km (combined)",
      weight: "1,295 kg",
    },
    2024: {
      power: "125 PS @ 5,000 rpm",
      torque: "210 Nm @ 1,500 - 4,500 rpm",
      acceleration: "8.5 seconds (0-100 km/h)",
      topSpeed: "208 km/h",
      fuelEconomy: "4.7 L/100 km (combined)",
      weight: "1,300 kg",
    },
  },
  commonIssues: {
    2019: [
      "Minor software glitches in infotainment system",
      "Occasional wind noise at high speeds",
      "Premature wear of brake pads",
    ],
    2020: [
      "Issues with adaptive cruise control sensor",
      "Intermittent connectivity problems with Car-Net",
      "Minor leaks in the sunroof seals",
    ],
    2021: [
      "Faulty blind spot monitoring sensors",
      "Electrical issues with interior lighting",
      "Clutch wear in manual transmissions",
    ],
    2022: [
      "Suspension noise from Sportline trim",
      "Software updates required for augmented reality display",
      "Turbocharger efficiency drops over time",
    ],
    2023: [
      "Battery drain issues in hybrid models",
      "Inconsistent performance of advanced driver assistance systems",
      "Air conditioning system malfunctions",
    ],
    2024: [
      "Issues with augmented reality head-up display calibration",
      "Connectivity drops in wireless smartphone integration",
      "Premature wear of sustainably sourced interior materials",
    ],
  },
  purchaseLinks: [
    { name: "AutoScout24", url: "https://www.autoscout24.com/lst/volkswagen/golf-8-tsi-1.0" },
    { name: "Mobile.de", url: "https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=;;;Volkswagen+Golf+8+TSI+1.0&s=Car&sb=rel&vc=Car" },
    { name: "Volkswagen Official", url: "https://www.volkswagen.de/de/modelle/golf/golf-8.html" },
  ],
};

export const hondaNsxData: CarData = {
  id: 520203045,
  name: "Honda NSX",
  price: "€60,000 - €120,000",
  images: [
    "/carImages/hondaNSX/front.jpg",
  ],
  description:
    "The Honda NSX, produced from 1990 to 2005, is a legendary mid-engine sports car renowned for its exceptional handling, reliability, and innovative engineering. Developed with input from Formula 1 driver Ayrton Senna, the NSX features an aluminum monocoque chassis, a high-revving V6 engine, and a driver-centric interior. Its blend of performance, everyday usability, and iconic design has made it a beloved classic among enthusiasts.",
  features: {
    1990: [
      "Mid-engine 3.0L V6 engine",
      "6-speed manual or 5-speed automatic transmission",
      "Aluminum monocoque chassis",
      "Driver-centric cockpit",
    ],
    1991: [
      "Improved suspension tuning",
      "Enhanced brake system",
      "Optional leather interior",
    ],
    1992: [
      "Introduction of the Type S model",
      "Revised aerodynamic elements",
      "Upgraded sound insulation",
    ],
    1993: [
      "Increased engine power",
      "Advanced traction control system",
      "Upgraded infotainment system",
    ],
    1994: [
      "Limited Edition models released",
      "Enhanced safety features",
      "Improved cooling system",
    ],
    1995: [
      "Special Edition color options",
      "Upgraded interior materials",
      "Advanced aerodynamics package",
    ],
    1996: [
      "Introduction of the Type R model",
      "Performance suspension upgrades",
      "Lightweight alloy wheels",
    ],
    1997: [
      "Enhanced engine management system",
      "Improved fuel efficiency",
      "Advanced electronic stability control",
    ],
    1998: [
      "Revised exhaust system for better sound",
      "Upgraded brake calipers",
      "Enhanced aerodynamics for high-speed stability",
    ],
    1999: [
      "Introduction of the Anniversary Edition",
      "Upgraded interior technology",
      "Advanced emission control systems",
    ],
    2000: [
      "Facelift with updated exterior styling",
      "Improved infotainment interface",
      "Enhanced safety features",
    ],
    2001: [
      "Introduction of the Hybrid variant",
      "Advanced hybrid powertrain",
      "Improved fuel economy",
    ],
    2002: [
      "Limited production run for final models",
      "Exclusive color options",
      "Enhanced performance tuning",
    ],
    2003: [
      "Final Edition released",
      "Special badging and trim",
      "Commemorative interior features",
    ],
    2004: [
      "Last production year with exclusive features",
      "Enhanced reliability improvements",
      "Final engine tuning for optimal performance",
    ],
    2005: [
      "Final model year with all enhancements",
      "Collector’s edition features",
      "Comprehensive quality checks",
    ],
  },
  modelYears: {
    1990: {
      power: "270 PS @ 7,000 rpm",
      torque: "283 Nm @ 5,200 rpm",
      acceleration: "5.5 seconds (0-100 km/h)",
      topSpeed: "285 km/h",
      fuelEconomy: "12.0 L/100 km (combined)",
      weight: "1,370 kg",
    },
    1991: {
      power: "275 PS @ 7,200 rpm",
      torque: "290 Nm @ 5,300 rpm",
      acceleration: "5.4 seconds (0-100 km/h)",
      topSpeed: "287 km/h",
      fuelEconomy: "11.8 L/100 km (combined)",
      weight: "1,375 kg",
    },
    1992: {
      power: "280 PS @ 7,200 rpm",
      torque: "295 Nm @ 5,400 rpm",
      acceleration: "5.3 seconds (0-100 km/h)",
      topSpeed: "289 km/h",
      fuelEconomy: "11.6 L/100 km (combined)",
      weight: "1,380 kg",
    },
    1993: {
      power: "290 PS @ 7,500 rpm",
      torque: "300 Nm @ 5,500 rpm",
      acceleration: "5.1 seconds (0-100 km/h)",
      topSpeed: "291 km/h",
      fuelEconomy: "11.4 L/100 km (combined)",
      weight: "1,385 kg",
    },
    1994: {
      power: "295 PS @ 7,600 rpm",
      torque: "305 Nm @ 5,600 rpm",
      acceleration: "5.0 seconds (0-100 km/h)",
      topSpeed: "293 km/h",
      fuelEconomy: "11.2 L/100 km (combined)",
      weight: "1,390 kg",
    },
    1995: {
      power: "300 PS @ 7,700 rpm",
      torque: "310 Nm @ 5,700 rpm",
      acceleration: "4.9 seconds (0-100 km/h)",
      topSpeed: "295 km/h",
      fuelEconomy: "11.0 L/100 km (combined)",
      weight: "1,395 kg",
    },
    1996: {
      power: "305 PS @ 7,800 rpm",
      torque: "315 Nm @ 5,800 rpm",
      acceleration: "4.8 seconds (0-100 km/h)",
      topSpeed: "297 km/h",
      fuelEconomy: "10.9 L/100 km (combined)",
      weight: "1,400 kg",
    },
    1997: {
      power: "310 PS @ 7,900 rpm",
      torque: "320 Nm @ 5,900 rpm",
      acceleration: "4.7 seconds (0-100 km/h)",
      topSpeed: "299 km/h",
      fuelEconomy: "10.8 L/100 km (combined)",
      weight: "1,405 kg",
    },
    1998: {
      power: "315 PS @ 8,000 rpm",
      torque: "325 Nm @ 6,000 rpm",
      acceleration: "4.6 seconds (0-100 km/h)",
      topSpeed: "301 km/h",
      fuelEconomy: "10.7 L/100 km (combined)",
      weight: "1,410 kg",
    },
    1999: {
      power: "320 PS @ 8,100 rpm",
      torque: "330 Nm @ 6,100 rpm",
      acceleration: "4.5 seconds (0-100 km/h)",
      topSpeed: "303 km/h",
      fuelEconomy: "10.6 L/100 km (combined)",
      weight: "1,415 kg",
    },
    2000: {
      power: "325 PS @ 8,200 rpm",
      torque: "335 Nm @ 6,200 rpm",
      acceleration: "4.4 seconds (0-100 km/h)",
      topSpeed: "305 km/h",
      fuelEconomy: "10.5 L/100 km (combined)",
      weight: "1,420 kg",
    },
    2001: {
      power: "330 PS @ 8,300 rpm",
      torque: "340 Nm @ 6,300 rpm",
      acceleration: "4.3 seconds (0-100 km/h)",
      topSpeed: "307 km/h",
      fuelEconomy: "10.4 L/100 km (combined)",
      weight: "1,425 kg",
    },
    2002: {
      power: "335 PS @ 8,400 rpm",
      torque: "345 Nm @ 6,400 rpm",
      acceleration: "4.2 seconds (0-100 km/h)",
      topSpeed: "309 km/h",
      fuelEconomy: "10.3 L/100 km (combined)",
      weight: "1,430 kg",
    },
    2003: {
      power: "340 PS @ 8,500 rpm",
      torque: "350 Nm @ 6,500 rpm",
      acceleration: "4.1 seconds (0-100 km/h)",
      topSpeed: "311 km/h",
      fuelEconomy: "10.2 L/100 km (combined)",
      weight: "1,435 kg",
    },
    2004: {
      power: "345 PS @ 8,600 rpm",
      torque: "355 Nm @ 6,600 rpm",
      acceleration: "4.0 seconds (0-100 km/h)",
      topSpeed: "313 km/h",
      fuelEconomy: "10.1 L/100 km (combined)",
      weight: "1,440 kg",
    },
    2005: {
      power: "350 PS @ 8,700 rpm",
      torque: "360 Nm @ 6,700 rpm",
      acceleration: "3.9 seconds (0-100 km/h)",
      topSpeed: "315 km/h",
      fuelEconomy: "10.0 L/100 km (combined)",
      weight: "1,445 kg",
    },
  },
  commonIssues: {
    1990: [
      "Electrical system glitches",
      "Cooling system leaks",
      "Suspension wear",
    ],
    1991: [
      "Clutch wear in manual transmissions",
      "Oil leaks from engine seals",
      "Brake pad wear",
    ],
    1992: [
      "Turbocharger issues in Type S models",
      "Electrical wiring problems",
      "Suspension noise",
    ],
    1993: [
      "Traction control system malfunctions",
      "Infotainment system software bugs",
      "Exhaust system leaks",
    ],
    1994: [
      "Brake system corrosion",
      "Interior trim wear",
      "Cooling fan failures",
    ],
    1995: [
      "Aerodynamics package installation issues",
      "Electrical component failures",
      "Steering system wear",
    ],
    1996: [
      "Performance suspension failures",
      "Alloy wheel damage",
      "Transmission fluid leaks",
    ],
    1997: [
      "Engine management system errors",
      "Fuel efficiency drops",
      "Electronic stability control issues",
    ],
    1998: [
      "Exhaust system degradation",
      "Brake caliper failures",
      "Aerodynamic component loosening",
    ],
    1999: [
      "Interior technology malfunctions",
      "Emission control system failures",
      "Engine overheating issues",
    ],
    2000: [
      "Exterior facelift component issues",
      "Infotainment interface bugs",
      "Safety feature malfunctions",
    ],
    2001: [
      "Hybrid powertrain reliability issues",
      "Battery performance degradation",
      "Fuel economy inconsistencies",
    ],
    2002: [
      "Limited Edition model component failures",
      "Performance tuning inconsistencies",
      "Interior material wear",
    ],
    2003: [
      "Final Edition special badging issues",
      "Trim component failures",
      "Commemorative feature malfunctions",
    ],
    2004: [
      "Reliability improvements not fully effective",
      "Final engine tuning issues",
      "Collector’s edition feature wear",
    ],
    2005: [
      "Collector’s edition component failures",
      "Overall wear and tear from usage",
      "Final quality check oversights",
    ],
  },
  purchaseLinks: [
    { name: "AutoScout24", url: "https://www.autoscout24.com/lst/honda/nsx" },
    { name: "Mobile.de", url: "https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=;;;Honda+NSX&s=Car&sb=rel&vc=Car" },
    { name: "Honda Official", url: "https://www.honda.de/nsx" },
  ],
};
  
export const carData: CarData[] = [corvetteC5Data, lancerEvoXData, ferrari348Data, golf8TSIData, hondaNsxData];