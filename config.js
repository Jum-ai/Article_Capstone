const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs } = require("firebase/firestore");

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAlMkAYfm4i0LYHdglcrCUQluxJALQjgbU",
  authDomain: "article-capstone.firebaseapp.com",
  projectId: "article-capstone",
  storageBucket: "article-capstone.firebasestorage.app",
  messagingSenderId: "357569607616",
  appId: "1:357569607616:web:16378895997af5a65c7a25",
  measurementId: "G-91PL82CXTN",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore
const db = getFirestore(app);

// Operasi pada koleksi "Articles"
const Article = {
  add: async (data) => {
    try {
      await addDoc(collection(db, "Articles"), data);
      console.log("Article added successfully");
    } catch (error) {
      console.error("Error adding article:", error);
    }
  },
  get: async () => {
    try {
      const snapshot = await getDocs(collection(db, "Articles"));
      return snapshot;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  },
};

module.exports = Article;
