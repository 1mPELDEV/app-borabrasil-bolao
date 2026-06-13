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

    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    window.location.href = "/bolao";
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  if (user) {
    return (
      <main className="min-h-screen bg-[#0a1628] text-slate-200 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#0f1f3a] border border-white/5 rounded-xl overflow-hidden">
            {/* Header do card */}
            <div className="bg-gradient-to-br from-[#063d1e] to-[#0a1628] border-b border-[#009c3b]/30 px-6 py-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,156,59,0.18),transparent_65%)] pointer-events-none" />
              <div className="inline-flex items-center gap-1.5 bg-[#009c3b]/15 border border-[#009c3b]/40 rounded-full px-4 py-1 text-[11px] font-semibold text-green-400 tracking-widest uppercase mb-3">
                <span>🏆</span> Copa do Mundo 2026
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Bem-vindo, <span className="text-yellow-400">{user.username}</span> 🇧🇷
              </h1>
              <p className="text-slate-500 text-sm mt-1">Você está pronto para o bolão</p>
            </div>

            {/* Ações */}
            <div className="px-6 py-5 flex flex-col gap-3">
              <a
                href="/bolao"
                className="w-full py-2.5 rounded-lg bg-[#009c3b] hover:bg-[#00b844] active:scale-[0.98] text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                ⚽ Ir para o bolão
              </a>
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-sm font-bold transition-all"
              >
                Sair
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            By <span className="text-green-400 font-semibold">Pedro Felipe</span>
            <span className="text-slate-600"> - Software Developer</span>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#009c3b]/15 border border-[#009c3b]/40 rounded-full px-4 py-1 text-[11px] font-semibold text-green-400 tracking-widest uppercase mb-4">
            <span>🏆</span> Copa do Mundo 2026
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Bolão <span className="text-yellow-400">Chateado</span> 🇧🇷
          </h1>
          <p className="text-slate-500 text-sm mt-1"> </p>
          <div className="flex justify-center gap-0.5 mt-4">
            <div className="h-1 w-12 rounded-full bg-[#009c3b]" />
            <div className="h-1 w-7 rounded-full bg-[#ffdf00]" />
            <div className="h-1 w-12 rounded-full bg-[#002776]" />
          </div>
        </div>

        {/* Card de login */}
        <div className="bg-[#0f1f3a] border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border-b border-white/5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#009c3b] animate-pulse" />
            <span className="text-[11px] font-bold text-[#009c3b] uppercase tracking-widest">
              Acesso ao bolão
            </span>
          </div>

          <div className="px-5 py-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                placeholder="Digite seu username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
                className="w-full px-4 py-2.5 rounded-lg bg-[#162033] border border-white/10 text-slate-200 placeholder:text-slate-600 text-sm outline-none focus:border-[#009c3b]/50 transition-colors"
              />
            </div>

            <button
              onClick={handleCreateUser}
              disabled={!username.trim()}
              className="w-full py-2.5 rounded-lg bg-[#009c3b] hover:bg-[#00b844] active:scale-[0.98] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
            >
              ⚽ Entrar no bolão
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By <span className="text-green-400 font-semibold">Pedro Felipe</span>
          <span className="text-slate-600"> - Software Developer</span>
        </p>
      </div>
    </main>
  );
}
