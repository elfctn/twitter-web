import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// API'mizin temel URL'i
const API_URL = "http://localhost:3000";

// =================================================================
// 1. API Servisi: Tüm backend isteklerini yöneten merkezi bir yapı
// =================================================================
const createApiClient = (token) => {
  const apiClient = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
  return apiClient;
};

// =================================================================
// 2. Yardımcı Bileşenler (UI Parçaları)
// =================================================================

//Toast
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  const styles = type === "success" ? "bg-green-500" : "bg-red-500";
  return (
    <div
      className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50 ${styles}`}
    >
      {message}
    </div>
  );
};

// Yeni Tweet gönderme formu
const TweetForm = ({ onTweetPosted }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await onTweetPosted(content);
    setContent("");
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white p-4 rounded-lg shadow"
    >
      <textarea
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        rows="3"
        placeholder="Aklından ne geçiyor?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-300"
      >
        {loading ? "Gönderiliyor..." : "Tweetle"}
      </button>
    </form>
  );
};

// Tek bir Yorumu gösteren kart
const CommentCard = ({ comment, onAction, currentUsername }) => {
  const isOwner = comment.user.username === currentUsername;
  return (
    <div className="bg-slate-100 p-3 rounded-md mt-3">
      <div className="flex items-center text-sm mb-1">
        <div className="font-bold text-slate-700">{comment.user.username}</div>
        <div className="text-xs text-slate-500 ml-2">
          · {new Date(comment.createdAt).toLocaleString()}
        </div>
        {isOwner && (
          <div className="ml-auto space-x-2">
            <button
              onClick={() => onAction("update_comment", comment)}
              className="text-xs hover:text-sky-500 font-semibold"
            >
              Düzenle
            </button>
            <button
              onClick={() => onAction("delete_comment", comment.id)}
              className="text-xs hover:text-red-500 font-semibold"
            >
              Sil
            </button>
          </div>
        )}
      </div>
      <p className="text-slate-600 text-sm">{comment.content}</p>
    </div>
  );
};

// Tek bir Tweet'i gösteren kart bileşeni
const TweetCard = ({ tweet, onAction, currentUsername }) => {
  const [showComments, setShowComments] = useState(false);

  // DÜZELTME: Olası 'undefined' hatalarını önlemek için güvenli kontroller ekliyoruz.
  const isOwner = tweet.user?.username === currentUsername;
  const likes = tweet.likes || [];
  const retweets = tweet.retweets || [];
  const comments = tweet.comments || [];

  const isLikedByCurrentUser = likes.some(
    (like) => like.user?.username === currentUsername
  );
  const isRetweetedByCurrentUser = retweets.some(
    (rt) => rt.user?.username === currentUsername
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 transition-all">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 mr-3">
          {tweet.user?.username?.substring(0, 1).toUpperCase() || "?"}
        </div>
        <div>
          <div className="font-bold text-slate-800">
            {tweet.user?.username || "Bilinmeyen Kullanıcı"}
          </div>
          <div className="text-xs text-slate-500">
            {new Date(tweet.createdAt).toLocaleString()}
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => onAction("delete_tweet", tweet.id)}
            className="ml-auto text-slate-400 hover:text-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <p className="text-slate-700 my-4">{tweet.content}</p>

      <div className="flex space-x-4 text-sm text-slate-500 py-2 border-t border-b border-slate-100">
        <span>
          <span className="font-bold">{retweets.length}</span> Retweet
        </span>
        <span>
          <span className="font-bold">{likes.length}</span> Beğeni
        </span>
      </div>

      <div className="flex items-center justify-around text-slate-600 pt-2">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 hover:text-sky-500 p-2 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{comments.length}</span>
        </button>
        <button
          onClick={() => onAction("retweet", tweet)}
          className={`flex items-center space-x-2 hover:text-green-500 p-2 rounded-full transition-colors ${
            isRetweetedByCurrentUser ? "text-green-500 font-bold" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h5M20 20v-5h-5M4 20L20 4"
            />
          </svg>
          <span>Retweet</span>
        </button>
        <button
          onClick={() => onAction("like", tweet)}
          className={`flex items-center space-x-2 hover:text-red-500 p-2 rounded-full transition-colors ${
            isLikedByCurrentUser ? "text-red-500 font-bold" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${
              isLikedByCurrentUser ? "fill-current" : "fill-none"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
          <span>Beğen</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onAction={onAction}
                currentUsername={currentUsername}
              />
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center">
              Henüz hiç yorum yok.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const content = e.target.elements.content.value;
              if (content) {
                onAction("comment", tweet.id, content);
                e.target.reset();
              }
            }}
            className="mt-4 flex space-x-2"
          >
            <input
              name="content"
              className="w-full bg-slate-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Yorumunu yaz..."
            />
            <button
              type="submit"
              className="bg-sky-500 text-white px-4 rounded-lg text-sm font-semibold"
            >
              Gönder
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// =================================================================
// 3. Ana Sayfalar
// =================================================================

// Ana Sayfa: Kayıt ve Giriş butonlarını gösterir
const HomePage = ({ onNavigate }) => (
  <div className="text-center">
    <h1 className="text-5xl font-bold text-slate-800 mb-4">
      @elfctn - Twitter
    </h1>
    <p className="text-slate-600 mb-8">
      Projeyi test etmek için kayıt ol veya giriş yap.
    </p>
    <div className="space-x-4">
      <button
        onClick={() => onNavigate("register")}
        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Kayıt Ol
      </button>
      <button
        onClick={() => onNavigate("login")}
        className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Giriş Yap
      </button>
    </div>
  </div>
);

// Kayıt Sayfası
const RegisterPage = ({ onNavigate, showToast }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      showToast(
        "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...",
        "success"
      );
      setTimeout(() => onNavigate("login"), 1500);
    } catch (error) {
      showToast(error.response?.data?.message || "Kayıt başarısız.", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8"
      >
        <h2 className="text-2xl text-center font-bold text-slate-800 mb-6">
          Hesap Oluştur
        </h2>
        <div className="mb-4">
          <label
            className="block text-slate-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Kullanıcı Adı
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700"
            id="username"
            name="username"
            type="text"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-slate-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700"
            id="email"
            name="email"
            type="email"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-slate-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Şifre
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700"
            id="password"
            name="password"
            type="password"
            onChange={handleChange}
            required
          />
        </div>
        <button
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg w-full disabled:bg-sky-300"
          type="submit"
          disabled={loading}
        >
          {loading ? "..." : "Kayıt Ol"}
        </button>
      </form>
    </div>
  );
};

// Giriş Sayfası
const LoginPage = ({ onLoginSuccess, showToast }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      onLoginSuccess(response.data.token);
    } catch (error) {
      showToast(error.response?.data?.message || "Giriş başarısız.", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8"
      >
        <h2 className="text-2xl text-center font-bold text-slate-800 mb-6">
          Giriş Yap
        </h2>
        <div className="mb-4">
          <label
            className="block text-slate-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Kullanıcı Adı
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700"
            id="username"
            name="username"
            type="text"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-slate-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Şifre
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700"
            id="password"
            name="password"
            type="password"
            onChange={handleChange}
            required
          />
        </div>
        <button
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg w-full disabled:bg-sky-300"
          type="submit"
          disabled={loading}
        >
          {loading ? "..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
};

// Ana Akış Sayfası
const FeedPage = ({ token, onLogout, showToast }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiClient = createApiClient(token);

  const getUsernameFromToken = (jwt) => {
    if (!jwt) return null;
    try {
      return JSON.parse(atob(jwt.split(".")[1])).sub;
    } catch (e) {
      return null;
    }
  };
  const currentUsername = getUsernameFromToken(token);

  const fetchTweets = useCallback(async () => {
    try {
      const response = await apiClient.get("/tweet");
      setTweets(
        response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      showToast("Tweetler yüklenemedi.", "error");
    } finally {
      setLoading(false);
    }
  }, [apiClient, showToast]);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  const handleTweetPosted = async (content) => {
    try {
      await apiClient.post("/tweet", { content });
      showToast("Tweet başarıyla gönderildi!", "success");
      fetchTweets();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Tweet gönderilemedi.",
        "error"
      );
    }
  };

  const handleAction = async (action, target, meta) => {
    try {
      let message = "";
      const isLikedByCurrentUser = target.likes?.some(
        (like) => like.user?.username === currentUsername
      );
      const currentUserRetweet = target.retweets?.find(
        (r) => r.user.username === currentUsername
      );

      switch (action) {
        case "comment":
          if (meta) {
            // meta burada yorum içeriği
            await apiClient.post(`/comment/${target}`, { content: meta });
            message = "Yorum eklendi!";
          }
          break;
        case "like":
          if (isLikedByCurrentUser) {
            await apiClient.delete(`/like/${target.id}`);
            message = "Beğeni geri alındı.";
          } else {
            await apiClient.post(`/like/${target.id}`);
            message = "Tweet beğenildi!";
          }
          break;
        case "retweet":
          if (currentUserRetweet) {
            await apiClient.delete(`/retweet/${currentUserRetweet.id}`);
            message = "Retweet geri alındı.";
          } else {
            await apiClient.post(`/retweet/${target.id}`);
            message = "Retweet yapıldı!";
          }
          break;
        case "delete_tweet":
          if (window.confirm("Bu tweeti silmek istediğinizden emin misiniz?")) {
            await apiClient.delete(`/tweet/${target}`);
            message = "Tweet silindi.";
          }
          break;
        case "update_comment":
          const newContent = prompt("Yeni yorumunuzu girin:", target.content);
          if (newContent) {
            await apiClient.put(`/comment/${target.id}`, {
              content: newContent,
            });
            message = "Yorum güncellendi!";
          }
          break;
        case "delete_comment":
          if (window.confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
            await apiClient.delete(`/comment/${target}`);
            message = "Yorum silindi.";
          }
          break;
        default:
          return;
      }
      if (message) showToast(message, "success");
      fetchTweets();
    } catch (error) {
      showToast(
        error.response?.data?.message || "İşlem başarısız oldu.",
        "error"
      );
    }
  };

  if (loading)
    return <div className="text-slate-500 text-center">Yükleniyor...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Twitter Klonu</h1>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Çıkış Yap
        </button>
      </div>
      <TweetForm onTweetPosted={handleTweetPosted} />
      <div>
        {tweets.length > 0 ? (
          tweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onAction={handleAction}
              currentUsername={currentUsername}
            />
          ))
        ) : (
          <p className="text-center text-slate-500 mt-8">
            Henüz hiç tweet atılmamış. İlk tweet'i sen at!
          </p>
        )}
      </div>
    </div>
  );
};

// Ana App Bileşeni: Yönlendirici (Router) görevi görür
function App() {
  const [page, setPage] = useState("home");
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (token && page === "home") {
      setPage("feed");
    }
  }, [token, page]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleLoginSuccess = (receivedToken) => {
    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);
    setPage("feed");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPage("home");
  };

  const renderPage = () => {
    if (token) {
      return (
        <FeedPage token={token} onLogout={handleLogout} showToast={showToast} />
      );
    }

    switch (page) {
      case "login":
        return (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            showToast={showToast}
          />
        );
      case "register":
        return <RegisterPage onNavigate={setPage} showToast={showToast} />;
      case "home":
      default:
        return <HomePage onNavigate={setPage} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center font-sans p-4">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast({ ...toast, show: false })}
        />
      )}
      {renderPage()}
    </div>
  );
}

export default App;
