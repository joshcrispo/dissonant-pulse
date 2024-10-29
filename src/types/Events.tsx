export type Event = {
  id: string;
  eventName: string;
  artists: string[];
  startDate: Date;
  endDate: Date;
  photoURL?: string;
  location?: string;
  club?: string;
  bio?: string;
  artistImages?: (string | null)[];
  ticketPrice?: number;
};
