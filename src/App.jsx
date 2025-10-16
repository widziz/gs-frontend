import React, { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { Wheel } from "./components/Wheel";
import { authWithTelegram } from "./api";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      console.error("Telegram WebApp не найден. Запусти через Telegram.");
      return;
    }

    // получаем initData — Telegram передаёт её при запуске мини-приложения
    const initData = tg.initData;

    if (!initData) {
      console.error("initData пустая — приложение запущено вне Telegram?");
      return;
    }

    // отправляем на бекенд
    authWithTelegram(initData).then((data) => {
      if (data?.username) {
        setUser(data);
      } else {
        console.error("Ошибка авторизации:", data);
      }
    });
  }, []);

  return (
    <div className="app">
      {user && <TopBar user={user} />}
      <Wheel />
    </div>
  );
}

export default App;
