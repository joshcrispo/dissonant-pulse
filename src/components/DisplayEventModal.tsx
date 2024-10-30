import React from "react";
import { Event } from "../types/Events";

interface DisplayEventModalProps {
  events: Event[];
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

const DisplayEventModal: React.FC<DisplayEventModalProps> = ({
  events,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-neutral-900 text-white p-6 sm:p-8 rounded-lg shadow-lg relative w-11/12 md:w-3/5 max-h-[80vh] overflow-y-auto">
        <span
          className="absolute top-1 right-3 text-5xl sm:text-5xl cursor-pointer"
          onClick={onClose}
        >
          ×
        </span>
        <h2 className="text-center text-xl lg:text-5xl font-bold mb-4 pl-2 sm:pl-4">
          UPCOMING EVENTS
        </h2>
        <div className="space-y-4 w-full max-w-4xl mb-4">
          {events.map((event) => {
            const startTime = `${event.startDate.toLocaleDateString()} ${event.startDate.toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            )}`;
            const endTime = `${event.endDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;

            return (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row items-center bg-neutral-900 text-white p-4 hover:text-gray-400 transition duration-300 ease-in-out transform hover:scale-105 border border-transparent hover:border-gray-600"
              >
                {event.photoURL && (
                  <img
                    src={event.photoURL}
                    alt={`${event.eventName} cover`}
                    className="w-full h-48 sm:w-64 object-fill mb-4 sm:mb-0 sm:mr-4"
                  />
                )}
                <div className="flex-1 w-full">
                  <h2 className="text-3xl sm:text-2xl font-bold mb-2">
                    {event.eventName}
                  </h2>
                  <p className="hidden lg:block font-bold mb-1">
                    {event.artists.join(", ")}
                  </p>
                  <p className="hidden lg:block font-bold mb-1">{event.club}</p>
                  <p className="hidden lg:block mb-1">
                    {startTime} - {endTime}
                  </p>
                  <p className="hidden lg:block mb-1">
                    Ticket Price: €{event.ticketPrice}
                  </p>
                  <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-2 mt-2">
                    <button
                      className="bg-orange-600 w-full sm:w-auto rounded-lg border border-white text-white p-2 mb-2 sm:mb-0 hover:bg-orange-400 transition duration-300 ease-in-out"
                      onClick={() => onEdit(event)}
                    >
                      EDIT
                    </button>
                    <button
                      className="bg-red-900 w-full sm:w-auto font-bold rounded-lg border border-white text-white p-2 hover:bg-red-600 transition duration-300 ease-in-out"
                      onClick={() => onDelete(event.id)}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DisplayEventModal;
