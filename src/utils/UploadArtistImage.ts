import { uploadFile } from "./UploadFile";
import { v4 as uuid } from 'uuid'; // Ensure you have this import for uuid

interface EditingEvent {
    artistImages: string[];
}

export const uploadArtistImages = async (
    artistImages: (File | null)[],
    editingEvent?: EditingEvent
): Promise<(string | null)[]> => {
    const urls: (string | null)[] = [];

    for (let i = 0; i < artistImages.length; i++) {
        const artistImage = artistImages[i];
        if (artistImage instanceof File) { // Use instanceof to check the type
            const url = await uploadFile(artistImage, `artists/${uuid()}`);
            urls.push(url);
        } else if (editingEvent?.artistImages && editingEvent.artistImages[i]) {
            urls.push(editingEvent.artistImages[i]);
        } else {
            urls.push(null);
        }
    }

    return urls;
};
