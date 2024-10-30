import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const fetchEvents = async () => {
  const eventsCollection = collection(db, "events");
  const eventsSnapshot = await getDocs(eventsCollection);
  const eventsList = eventsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      eventName: data.eventName,
      artists: data.artists,
      startDate: (data.startDate as any).toDate(),
      endDate: (data.endDate as any).toDate(),
      photoURL: data.photoURL,
      location: data.location,
      club: data.club,
      bio: data.bio,
      artistImages: data.artistImages || [],
      ticketPrice: data.ticketPrice || 0,
    };
  });

  const currentDate = new Date();
  return eventsList.filter((event) => event.startDate > currentDate);
};
