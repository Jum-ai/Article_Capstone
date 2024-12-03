const express = require("express");
const cors = require("cors");
const axios = require("axios");
const Article = require("./config");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Selamat Datang, Silahkan coba fungsionalitas aplikasi artikel anda!!");
});
// Endpoint untuk mengambil data dari NewsAPI dan menyimpannya ke Firestore
app.get("/fetch-news", async (req, res) => {
  const { keyword = "gizi-bayi" } = req.query; // Kata kunci default adalah "stunting"
  try {
    const NEWS_API_URL = "https://newsapi.org/v2/everything";
    const API_KEY = "ae17631b330e4eb78c3a6aab475201a3"; // Ganti dengan API Key Anda

    // Request ke NewsAPI untuk mendapatkan data berita
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: `${keyword}`,
        apiKey: API_KEY,
        language: "id",
      },
    });

    // Data hasil dari NewsAPI
    const articles = response.data.articles;
    console.log(`Fetched ${articles.length} articles related to "${keyword}"`);

    // Simpan data berita lengkap ke Firestore
    for (const article of articles) {
      await Article.add({
        status: response.data.status,
        totalResults: response.data.totalResults,
        source: article.source,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        content: article.content,
      });
    }

    res.send({ msg: "News fetched and stored in Firestore successfully" });
  } catch (error) {
    console.error("Error fetching or storing news:", error.message);
    res.status(500).send({ error: "Failed to fetch or store news" });
  }
});

// Endpoint untuk mengambil semua data berita dari Firestore
app.get("/articles", async (req, res) => {
  try {
    // Ambil semua dokumen dari koleksi `Articles`
    const snapshot = await Article.get();

    if (snapshot.empty) {
      return res.status(404).send({ message: "No articles found" });
    }

    const articles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).send(articles);
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    res.status(500).send({ error: "Failed to fetch articles" });
  }
});

// Jalankan server
app.listen(4000, () => console.log("Server running on port 4000"));
