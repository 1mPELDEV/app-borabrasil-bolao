"use client";

import { useEffect, useState } from "react";
import { getMatch, seedMatch, } from "../actions/match";
import { savePrediction } from "../actions/prediction";
import { getRanking } from "../actions/ranking";
import { getPrediction } from "../actions/get-prediction";


export default function BolaoPage() {
  const [match, setMatch] = 
  useState<any>(null);

  const [ranking, setRanking] =
  useState<any[]>([]);

  const [prediction, setPrediction] =
  useState<any>(null);
  

  const [homeGuess, setHomeGuess] =
    useState(0);

  const [awayGuess, setAwayGuess] =
    useState(0);

  const bettingClosed =
  match &&
  new Date() > new Date(match.startsAt);

useEffect(() => {
  const storedUser =
    localStorage.getItem("user");

  if (!storedUser) {
    window.location.href = "/";
    return;
  }

  async function loadMatch() {
    await seedMatch();

    const data = await getMatch();

    setMatch(data);

    const user =
      JSON.parse(storedUser);

const userPrediction =
  await getPrediction(
    user.id,
    data.id
  );

        if (userPrediction) {
        setPrediction(
            userPrediction
        );

        setHomeGuess(
            userPrediction.homeGuess
        );

        setAwayGuess(
            userPrediction.awayGuess
        );
        }

    const rankingData =
      await getRanking();

    setRanking(rankingData);
  }

  loadMatch();
}, []);

  async function handleSavePrediction() {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    const savedPrediction =
    await savePrediction({
        userId: user.id,
        matchId: match.id,
        homeGuess,
        awayGuess,
    });

    setPrediction(
    savedPrediction
    );

    alert("Palpite salvo 😎");

    const rankingData =
    await getRanking();

    setRanking(rankingData);
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
      <div className="bg-zinc-800 p-8 rounded-xl text-center w-full max-w-md">
        <h1 className="text-4xl font-bold">
          {match.homeTeam}
        </h1>

        <p className="text-zinc-400 my-4">
          VS
        </p>

        <h2 className="text-4xl font-bold">
          {match.awayTeam}
        </h2>

        <div className="flex justify-center items-center gap-4 mt-8">
          <input
            type="number"
            value={homeGuess}
            onChange={(e) =>
              setHomeGuess(
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
            value={awayGuess}
            onChange={(e) =>
              setAwayGuess(
                Number(e.target.value)
              )
            }
            className="w-20 p-3 rounded bg-zinc-700 text-center text-2xl"
          />
        </div>

        <button
        onClick={handleSavePrediction}
        disabled={bettingClosed}
        className={`w-full p-3 rounded-lg mt-8 font-bold ${
            bettingClosed
            ? "bg-zinc-600 cursor-not-allowed"
            : "bg-green-600"
        }`}
        >
        {bettingClosed
            ? "Apostas encerradas ⛔"
            : "Salvar Palpite"}
        </button>

            {prediction && (
    <div className="mt-6 bg-zinc-700 rounded-xl p-4">
        <p className="text-zinc-400">
        Seu palpite
        </p>

        <h2 className="text-3xl font-bold mt-2">
        {prediction.homeGuess}
        {" x "}
        {prediction.awayGuess}
        ⚽
        </h2>

        {match.finished && (
        <div className="mt-4">
            <p className="text-zinc-400">
            Resultado oficial
            </p>

            <h3 className="text-2xl font-bold">
            {match.homeScore}
            {" x "}
            {match.awayScore}
            </h3>

            <p className="text-green-400 mt-2 font-bold">
            Você ganhou{" "}
            {prediction.points} pts 🏆
            </p>
        </div>
        )}
    </div>
    )}

    <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">
        🏆 Ranking
    </h2>

    <div className="space-y-2">
        {ranking.map((player, index) => (
        <div
            key={player.id}
            className="bg-zinc-700 rounded-lg p-3 flex justify-between"
        >
            <span>
                {
                index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}º`
                }
                {" "}   
             {player.username}
            </span>

            <span>
            {player.points} pts
            </span>
        </div>
        ))}
    </div>
    </div>

      </div>
    </main>
  );
}