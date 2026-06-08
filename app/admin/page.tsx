"use client";

import { useEffect, useState } from "react";
import {
  finishMatch,
  getMatch,
} from "../actions/match";

export default function AdminPage() {
  const [match, setMatch] =
    useState<any>(null);

  const [homeScore, setHomeScore] =
    useState(0);

  const [awayScore, setAwayScore] =
    useState(0);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/";
      return;
    }

    const user =
      JSON.parse(storedUser);

    if (user.username !== "pedro felipe") {
      window.location.href =
        "/bolao";

      return;
    }

    async function loadMatch() {
      const data =
        await getMatch();

      setMatch(data);
    }

    loadMatch();
  }, []);

  async function handleFinishMatch() {
    if (!match) return;

    await finishMatch(
      match.id,
      homeScore,
      awayScore
    );

    alert(
      "Jogo finalizado 😎"
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <h1>Carregando...</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="bg-zinc-800 p-8 rounded-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold">
          🛠️ Painel Admin
        </h1>

        <p className="mt-4">
          {match.homeTeam}
        </p>

        <p className="text-zinc-500">
          VS
        </p>

        <p>
          {match.awayTeam}
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <input
            type="number"
            value={homeScore}
            onChange={(e) =>
              setHomeScore(
                Number(e.target.value)
              )
            }
            className="w-20 p-3 rounded bg-zinc-700 text-center text-2xl"
          />

          <span className="text-3xl">
            x
          </span>

          <input
            type="number"
            value={awayScore}
            onChange={(e) =>
              setAwayScore(
                Number(e.target.value)
              )
            }
            className="w-20 p-3 rounded bg-zinc-700 text-center text-2xl"
          />
        </div>

        <button
          onClick={
            handleFinishMatch
          }
          className="w-full bg-green-600 mt-8 p-3 rounded-lg font-bold"
        >
          Finalizar jogo
        </button>
      </div>
    </main>
  );
}