// filepath: d:\reacnative\appshop\utils\firebaseStorage.js
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: 'AIzaSyC5gmvSNNdazFFJZvOvkwCKv58BcUMjJxU',
  authDomain: 'clothing-store-1165d.firebaseapp.com',
  projectId: 'clothing-store-1165d',
  storageBucket: 'clothing-store-1165d.appspot.com',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const getImageUrl = async (path) => {
  if (path.startsWith("http")) {
    return path; // là URL rồi, dùng luôn
  }

  try {
    const storageRef = ref(storage, path); // path là "images/product1.jpg"
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return "https://via.placeholder.com/150";
  }
};
// export const getImageUrl = async (path) => {
//   try {
//     const storageRef = ref(storage, path);
//     const url = await getDownloadURL(storageRef);
//     return url;
//   } catch (error) {
//     console.log(error);
//     console.error("Error fetching image URL:", error);
//     return "https://via.placeholder.com/150"; // Fallback URL
//   }
// };