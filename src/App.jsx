import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

// API'mizin temel URL'i
const API_URL = "http://localhost:3000";

// Basit bir bildirim (Toast) bileşeni
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const baseStyle =
    "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300";
  const typeStyle = type === "success" ? "bg-green-500" : "bg-red-500";

  return <div className={`${baseStyle} ${typeStyle}`}>{message}</div>;
};

// Ana Sayfa: Kayıt ve Giriş butonlarını gösterir
const HomePage = ({ onNavigate }) => (
  <div className="text-center">
    <h1 className="text-5xl font-bold text-slate-800 mb-4">
      Twitter Klonuna Hoş Geldin
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      showToast(
        "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...",
        "success"
      );
      setTimeout(() => onNavigate("login"), 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Kayıt işlemi başarısız oldu.";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            name="username"
            type="text"
            placeholder="Kullanıcı Adı"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            name="email"
            type="email"
            placeholder="Email"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            name="password"
            type="password"
            placeholder="******************"
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full disabled:bg-sky-300"
            type="submit"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </div>
        <p className="text-center text-slate-500 text-xs mt-4">
          Zaten bir hesabın var mı?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("login");
            }}
            className="text-sky-500 hover:text-sky-700"
          >
            Giriş Yap
          </a>
        </p>
      </form>
    </div>
  );
};

// Giriş Sayfası
const LoginPage = ({ onNavigate, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const displayToast = (message, type) => {
    setShowToast({ show: true, message, type });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      onLoginSuccess(response.data.token); // Token'ı ana bileşene gönder
    } catch (error) {
      displayToast(
        error.response?.data?.message ||
          "Giriş başarısız. Bilgilerinizi kontrol edin.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showToast.show && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onDismiss={() => setShowToast({ ...showToast, show: false })}
        />
      )}
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              name="username"
              type="text"
              placeholder="Kullanıcı Adı"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              name="password"
              type="password"
              placeholder="******************"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full disabled:bg-sky-300"
              type="submit"
              disabled={loading}
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
          <p className="text-center text-slate-500 text-xs mt-4">
            Hesabın yok mu?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("register");
              }}
              className="text-sky-500 hover:text-sky-700"
            >
              Kayıt Ol
            </a>
          </p>
        </form>
      </div>
    </>
  );
};

// Giriş yaptıktan sonra görünecek ana sayfa
const FeedPage = ({ token, onLogout }) => {
  // TODO: Tüm endpoint testleri burada yapılacak
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">Ana Sayfa</h1>
      <p className="text-slate-600 mb-8">Başarıyla giriş yaptın!</p>
      <div className="bg-white p-4 rounded-lg shadow-md text-left break-all mb-8">
        <h3 className="font-bold mb-2">Giriş Token'ın (JWT):</h3>
        <p className="text-xs text-slate-700">{token}</p>
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Çıkış Yap
      </button>
    </div>
  );
};

// Ana App Bileşeni: Yönlendirici (Router) görevi görür
function App() {
  const [page, setPage] = useState("home"); // 'home', 'login', 'register', 'feed'
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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
      return <FeedPage token={token} onLogout={handleLogout} />;
    }

    switch (page) {
      case "login":
        return (
          <LoginPage onNavigate={setPage} onLoginSuccess={handleLoginSuccess} />
        );
      case "register":
        return <RegisterPage onNavigate={setPage} showToast={showToast} />;
      case "home":
      default:
        return <HomePage onNavigate={setPage} />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center font-sans">
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
