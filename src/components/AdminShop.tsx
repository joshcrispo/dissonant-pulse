import { useEffect, useState } from "react";
import { ShopItem } from "../types/ShopItems";
import { v4 as uuidv4 } from "uuid";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { uploadFile } from "../utils/UploadFile";

interface AdminShopProps {
  showShopModal: boolean;
  showItems: boolean;
  onClose: () => void;
  onCloseItems: () => void;
}

const AdminShop = ({
  showShopModal,
  showItems,
  onClose,
  onCloseItems,
}: AdminShopProps) => {
  const [shopItemName, setShopItemName] = useState("");
  const [shopItemDescription, setShopItemDescription] = useState("");
  const [shopItemPrice, setShopItemPrice] = useState<number>(0);
  const [shopItemStock, setShopItemStock] = useState<number>(0);
  const [shopItemImageUrl, setShopItemImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    if (showItems) {
      fetchShopItems();
    }
  }, [showItems]);

  const fetchShopItems = async () => {
    try {
      const shopItemsCollection = collection(db, "shop_items");
      const snapshot = await getDocs(shopItemsCollection);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id, // Ensure to include the document ID
        ...doc.data(),
      })) as ShopItem[];
      console.log("Fetched shop items:", items); // Log fetched items
      setShopItems(items);
    } catch (error) {
      console.error("Error fetching shop items:", error);
    }
  };

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

  const handleAddOrUpdateItem = async () => {
    // Validate that all required fields are filled
    if (!shopItemName || !shopItemDescription || shopItemPrice <= 0) {
      console.error("Please fill in all shop fields.");
      return;
    }

    // Create the new shop item object without a manual ID
    const newItem: Omit<ShopItem, "id"> = {
      shopItemName,
      shopItemDescription,
      shopItemPrice,
      shopItemImageUrl,
      shopItemStock,
    };

    try {
      const shopItemsCollection = collection(db, "shop_items");

      if (editingItem) {
        // Update existing item
        const itemDoc = doc(db, "shop_items", editingItem.id);
        await updateDoc(itemDoc, newItem);
        console.log("Shop item updated:", newItem);
      } else {
        // Add new item
        await addDoc(shopItemsCollection, newItem);
        console.log("New shop item added:", newItem);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error adding/updating shop item:", error);
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

  const handleEditItem = (item: ShopItem) => {
    setEditingItem(item);
    setShopItemName(item.shopItemName);
    setShopItemDescription(item.shopItemDescription);
    setShopItemPrice(item.shopItemPrice);
    setShopItemStock(item.shopItemStock);
    setShopItemImageUrl(item.shopItemImageUrl);
    setImagePreview(item.shopItemImageUrl);
  };

  const handleDeleteItem = async (id: string) => {
    console.log("Deleting item with id:", id);

    if (!id) {
      console.error("Item id is undefined or null");
      return;
    }

    try {
      const itemDoc = doc(db, "shop_items", id);
      const docSnap = await getDoc(itemDoc);

      if (!docSnap.exists()) {
        console.error("No document found for id:", id);
        return;
      }

      await deleteDoc(itemDoc);
      console.log("Shop item deleted:", id);
      await fetchShopItems(); // Re-fetch shop items after deletion
    } catch (error) {
      console.error("Error deleting shop item:", error);
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
              className="bg-neutral-900 rounded-lg border border-white p-2 w-full text-white"
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
              <div className="flex justify-center mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-64 h-64 object-cover items-center justify-center"
                />
              </div>
            )}
            <button
              className="w-full bg-blue-600 rounded-[25px] text-white p-2 my-3"
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
              className="w-full bg-green-700 rounded-[25px] text-white p-2 mt-2"
              onClick={handleAddOrUpdateItem}
            >
              {editingItem ? "Update Shop Item" : "Add Shop Item"}
            </button>
          </div>
        </div>
      )}
      {showItems && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-900 text-white p-6 sm:p-8 rounded-lg shadow-lg relative w-5/6 md:w-3/5 max-h-[80vh] overflow-y-auto">
            <span
              className="absolute top-1 right-3 text-5xl sm:text-5xl cursor-pointer"
              onClick={onCloseItems}
            >
              ×
            </span>
            <h2 className="text-center text-xl lg:text-5xl font-bold mb-4 pl-2 sm:pl-4">
              SHOP ITEMS
            </h2>
            <div className="space-y-4 w-full max-w-4xl mb-4">
              {shopItems.length > 0 ? (
                shopItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center bg-neutral-900 text-white p-4"
                  >
                    {item.shopItemImageUrl && (
                      <img
                        src={item.shopItemImageUrl}
                        alt={item.shopItemName}
                        className="w-full h-48 sm:w-64 object-fill mb-4 sm:mb-0 sm:mr-4"
                      />
                    )}
                    <div className="flex-1 w-full">
                      <h3 className="text-3xl sm:text-2xl font-bold mb-2">
                        {item.shopItemName}
                      </h3>
                      <p className="mb-1">{item.shopItemDescription}</p>
                      <p className="font-bold mb-1">
                        Price: ${item.shopItemPrice}
                      </p>
                      <p className="font-bold mb-1">
                        Stock: {item.shopItemStock}
                      </p>
                      <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-2 mt-2">
                        <button
                          className="bg-orange-600 w-full sm:w-auto rounded-lg border border-white text-white p-2 mb-2 sm:mb-0 hover:bg-orange-400 transition duration-300 ease-in-out"
                          onClick={() => handleEditItem(item)}
                        >
                          EDIT
                        </button>
                        <button
                          className="bg-red-900 w-full sm:w-auto font-bold rounded-lg border border-white text-white p-2 hover:bg-red-600 transition duration-300 ease-in-out"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white">
                  No shop items available.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminShop;
