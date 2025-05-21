import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC5gmvSNNdazFFJZvOvkwCKv58BcUMjJxU',
  authDomain: 'clothing-store-1165d.firebaseapp.com',
  projectId: 'clothing-store-1165d',
  storageBucket: 'clothing-store-1165d.appspot.com',
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// Export Firebase services
export { db, auth };