import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export const deleteEvent = async (
  id: string,
  setEvents: React.Dispatch<React.SetStateAction<any[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    await deleteDoc(doc(db, "events", id));
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    setError(null);
  } catch (error) {
    console.error("Error deleting event:", error);
    setError("Failed to delete event.");
  }
};
