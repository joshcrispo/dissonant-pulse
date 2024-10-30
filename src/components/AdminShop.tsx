import { useState } from "react";
import { ShopItem } from "../types/ShopItems";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { uploadFile } from "../utils/UploadFile";

interface AdminShopProps {
  showShopModal: boolean;
  onClose: () => void;
}

const AdminShop = ({ showShopModal, onClose }: AdminShopProps) => {
  const [shopItemName, setShopItemName] = useState("");
  const [shopItemDescription, setShopItemDescription] = useState("");
  const [shopItemPrice, setShopItemPrice] = useState<number>(0);
  const [shopItemStock, setShopItemStock] = useState<number>(0);
  const [shopItemImageUrl, setShopItemImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const clearShopForm = () => {
    setShopItemName("");
    setShopItemDescription("");
    setShopItemPrice(0);
    setShopItemStock(0);
    setShopItemImageUrl("");
    setImagePreview(null);
  };

  const handleCloseModal = () => {
    clearShopForm();
    onClose();
  };

  const handleAddItem = async () => {
    if (!shopItemName || !shopItemDescription || shopItemPrice <= 0) {
      console.error("Please fill in all shop fields.");
      return;
    }
    const newItem: ShopItem = {
      id: uuidv4(),
      shopItemName,
      shopItemDescription,
      shopItemPrice,
      shopItemImageUrl,
      shopItemStock,
    };

    try {
      const shopItemsCollection = collection(db, "shop_items");
      await addDoc(shopItemsCollection, newItem); // Add the new item to Firestore

      console.log("New shop item added:", newItem); // For debugging
      handleCloseModal(); // Close the modal after adding
    } catch (error) {
      console.error("Error adding shop item:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const path = `shop_items/${file.name}`; // Set the path for where the file will be stored in Firebase Storage

      try {
        const url = await uploadFile(file, path); // Call the uploadFile function
        setShopItemImageUrl(url); // Store the image URL
        setImagePreview(url); // Optionally, if you want to show a preview
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <>
      {showShopModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-900 text-white p-6 rounded-lg shadow-lg relative w-3/5 max-h-[80vh] overflow-y-auto">
            <span
              className="absolute top-1 right-3 text-5xl cursor-pointer"
              onClick={handleCloseModal}
            >
              ×
            </span>
            <h2 className="text-5xl font-bold mb-4 text-center">
              ADD SHOP ITEM
            </h2>
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="text"
              value={shopItemName}
              onChange={(e) => setShopItemName(e.target.value)}
              placeholder="Shop Item Name"
            />
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleImageUpload}
            />
            {imagePreview && (
              <div className="flex justify-center my-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-64 h-64 object-cover items-center justify-center my-2"
                />
              </div>
            )}
            <button
              className="w-full bg-green-900 rounded-lg border border-white text-white p-2 mb-2"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {imagePreview ? "Change Photo" : "📷 Add Shop Item Photo"}
            </button>
            <textarea
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              value={shopItemDescription}
              onChange={(e) => setShopItemDescription(e.target.value)}
              placeholder="Shop Item Description"
            />
            <label className="text-white font-bold block">Item Price:</label>
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="number"
              value={shopItemPrice}
              onChange={(e) => setShopItemPrice(Number(e.target.value))}
            />
            <label className="text-white font-bold block">Stock:</label>
            <input
              className="bg-neutral-900 rounded-lg border border-white p-2 mb-2 w-full text-white"
              type="number"
              value={shopItemStock}
              onChange={(e) => setShopItemStock(Number(e.target.value))}
              placeholder="Shop Item Stock"
            />
            <button
              className="w-full bg-green-900 rounded-lg border border-white text-white p-2 mt-4"
              onClick={handleAddItem}
            >
              Add Shop Item
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminShop;
