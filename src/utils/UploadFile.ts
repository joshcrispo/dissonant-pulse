import { getDownloadURL, uploadBytes,
    ref as storageRef,
 } from "firebase/storage";
import { storage } from "../firebase";
 

export const uploadFile = async (file: File, path: string) => {
    if (!file) {
      throw new Error("Please select a file");
    }
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };
  