"use client";

import { useEffect, useState } from "react";
import { getMatch, seedMatch } from "../actions/match";
import { savePrediction } from "../actions/prediction";
import { getRanking } from "../actions/ranking";
import { getPrediction } from "../actions/get-prediction";

export default function BolaoPage() {
  // Trocamos 'any' por tipos básicos para evitar reclamações do compilador
  const [match, setMatch] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  
  const [homeGuess, setHomeGuess] = useState(0);
  const [awayGuess, setAwayGuess] = useState(0);

  const bettingClosed =
    match &&
    new Date() > new Date(match.startsAt);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/";
      return;
    }

    async function loadMatch() {
      await seedMatch();

      const data = await getMatch();

      // 🛡️ CORREÇÃO PRINCIPAL: Se 'data' for nulo, paramos a execução aqui.
      // Isso garante ao TypeScript que, da linha 39 para baixo, 'data' NUNCA será null.
      if (!data) {
        return;
      }

      setMatch(data);

      const user = JSON.parse(storedUser!);

      // Agora você pode passar 'data.id' com total segurança de tipo
      const userPrediction = await getPrediction(user.id, data.id);

      if (userPrediction) {
        setPrediction(userPrediction);
        setHomeGuess(userPrediction.homeGuess);
        setAwayGuess(userPrediction.awayGuess);
      }

      const rankingData = await getRanking();
      setRanking(rankingData);
    }

    loadMatch();
  }, []);

  async function handleSavePrediction() {
    const storedUser = localStorage.getItem("user");

    if (!storedUser || !match) return;

    const user = JSON.parse(storedUser!);

    const savedPrediction = await savePrediction({
      userId: user.id,
      matchId: match.id,
      homeGuess,
      awayGuess,
    });

    setPrediction(savedPrediction);

    alert("Palpite salvo 😎");

    const rankingData = await getRanking();
    setRanking(rankingData);
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <h1 className="text-xl animate-pulse">Carregando...</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
      <div className="bg-zinc-800 p-8 rounded-xl text-center w-full max-w-md shadow-2xl">
        <h1 className="text-4xl font-bold">{match.homeTeam}</h1>

        <p className="text-zinc-400 my-4 font-semibold">VS</p>

        <h2 className="text-4xl font-bold">{match.awayTeam}</h2>

        <div className="flex justify-center items-center gap-4 mt-8">
          <input
            type="number"
            value={homeGuess}
            disabled={bettingClosed}
            onChange={(e) => setHomeGuess(Number(e.target.value))}
            className="w-20 p-3 rounded bg-zinc-700 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          />

          <span className="text-3xl text-zinc-500">x</span>

          <input
            type="number"
            value={awayGuess}
            disabled={bettingClosed}
            onChange={(e) => setAwayGuess(Number(e.target.value))}
            className="w-20 p-3 rounded bg-zinc-700 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          />
        </div>

        <button
          onClick={handleSavePrediction}
          disabled={bettingClosed}
          className={`w-full p-3 rounded-lg mt-8 font-bold transition-all ${
            bettingClosed
              ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500 active:scale-95"
          }`}
        >
          {bettingClosed ? "Apostas encerradas ⛔" : "Salvar Palpite"}
        </button>

        {prediction && (
          <div className="mt-6 bg-zinc-700 rounded-xl p-4 border border-zinc-600">
            <p className="text-zinc-400 text-sm">Seu palpite</p>

            <h2 className="text-3xl font-bold mt-2 text-green-400">
              {prediction.homeGuess} {" x "} {prediction.awayGuess} ⚽
            </h2>

            {match.finished && (
              <div className="mt-4 pt-4 border-t border-zinc-600">
                <p className="text-zinc-400 text-sm">Resultado oficial</p>

                <h3 className="text-2xl font-bold">
                  {match.homeScore} {" x "} {match.awayScore}
                </h3>

                <p className="text-yellow-400 mt-2 font-bold">
                  Você ganhou {prediction.points || 0} pts 🏆
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-zinc-700">
          <h2 className="text-2xl font-bold mb-4">🏆 Ranking</h2>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {ranking.map((player, index) => (
              <div
                key={player.id || index}
                className="bg-zinc-700 rounded-lg p-3 flex justify-between items-center"
              >
                <span className="font-medium">
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}º`}{" "}
                  {player.username}
                </span>

                <span className="bg-zinc-600 px-2 py-1 rounded text-sm font-bold">
                  {player.points || 0} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}