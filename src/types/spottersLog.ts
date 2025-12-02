export type SpottersLogEntry = {
  id?: string;
  title: string;
  location: string;
  date: string;
  note: string;
  image?: string;
  tags: string[];
};

export type SpottersLogCategory = "airplanes" | "cars";
