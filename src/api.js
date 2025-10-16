const API_URL = "https://gs-backend-3l5t.onrender.com";

export async function authWithTelegram(initData) {
  const res = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  return res.json();
}

export async function getBalance(userId) {
  const res = await fetch(`${API_URL}/balance/${userId}`);
  return res.json();
}
