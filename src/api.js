
const API_URL = "https://gs-backend-3l5t.onrender.com";

export async function authWithTelegram(initData) {
  try {
    const response = await fetch(`${API_URL}/auth/telegram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ init_data: initData }),
    });

    if (!response.ok) {
      console.error("Ошибка при запросе авторизации:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("Ответ от бэкенда:", data);
    return data;
  } catch (err) {
    console.error("Ошибка соединения с API:", err);
    return null;
  }
}
