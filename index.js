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

app.delete("/articles/delete-all", async (req, res) => {
  try {
    await Article.deleteAll();
    res.send({ msg: "All articles have been deleted successfully" });
  } catch (error) {
    console.error("Error deleting articles:", error.message);
    res.status(500).send({ error: "Failed to delete articles" });
  }
});

app.post("/article/create", async (req, res) => {
  try {
    const { title, author, description, category, content, publishedAt, source, url, urlToImage } = req.body;

    if (!title || !content) {
      return res.status(400).send({ error: "Title and content are required" });
    }

    const newArticle = {
      title,
      author: author || "Anonymous", // Default value jika author tidak diberikan
      description: description || "No description provided",
      category,
      content,
      publishedAt: publishedAt || new Date().toISOString(),
      source: source || { name: "User Generated" },
      url: url || "No URL provided",
      urlToImage: urlToImage || "No image provided",
    };

    await Article.add(newArticle);

    res.status(201).send({ msg: "Article added successfully", article: newArticle });
  } catch (error) {
    console.error("Error adding manual article:", error.message);
    res.status(500).send({ error: "Failed to add manual article" });
  }
});

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

app.put("/articles/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    await Article.updateById(id, updates);
    res.send({ msg: `Article with ID ${id} has been updated successfully`, updates });
  } catch (error) {
    console.error("Error updating article by ID:", error.message);
    res.status(500).send({ error: `Failed to update article with ID ${id}` });
  }
});

app.delete("/articles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Article.deleteById(id);
    res.send({ msg: `Article with ID ${id} has been deleted successfully` });
  } catch (error) {
    console.error("Error deleting article by ID:", error.message);
    res.status(500).send({ error: `Failed to delete article with ID ${id}` });
  }
});

// Jalankan server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
