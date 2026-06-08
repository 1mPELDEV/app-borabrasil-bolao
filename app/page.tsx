"use client";

import { useEffect, useState } from "react";
import { createUser } from "./actions/user";

export default function Home() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function handleCreateUser() {
    const user = await createUser(username);

    if (!user) return;

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setUser(user);

    window.location.href = "/bolao";
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  if (user) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="bg-zinc-800 p-8 rounded-xl text-center">
          <h1 className="text-3xl font-bold">
            🇧🇷 Bem-vindo {user.username}
          </h1>

          <p className="text-zinc-400 mt-2">
            Você está pronto para o bolão
          </p>

          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded-lg mt-6"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="bg-zinc-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          Bolão do Brasil 🇧🇷
        </h1>

        <input
          type="text"
          placeholder="Digite seu username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-700 outline-none"
        />

        <button
          onClick={handleCreateUser}
          className="w-full bg-green-600 mt-4 p-3 rounded-lg font-bold"
        >
          Entrar
        </button>
      </div>
    </main>
  );
}