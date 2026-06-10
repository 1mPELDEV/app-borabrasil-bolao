"use client";

import { useEffect, useState } from "react";
import { getMatches } from "../actions/match";
import { savePrediction } from "../actions/prediction";
import { getRanking } from "../actions/ranking";
import { getPrediction } from "../actions/get-prediction";
import { getUsedPredictions } from "../actions/get-used-predictions";

export default function BolaoPage() {
  const [matches, setMatches] =
    useState<any[]>([]);

  const [ranking, setRanking] =
    useState<any[]>([]);

  const [predictions, setPredictions] =
    useState<any>({});

  const [usedPredictions, setUsedPredictions] =
  useState<any>({});

  const [guesses, setGuesses] =
    useState<any>({});


  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/";
      return;
    }

    async function loadData() {
      const user =
        JSON.parse(storedUser!);

      const matchesData =
        await getMatches();

      setMatches(matchesData);

      const usedMap: any = {};

    for (const match of matchesData) {
      const used =
        await getUsedPredictions(
          match.id
        );

      usedMap[match.id] =
        used;
    }

    setUsedPredictions(
      usedMap
  );

      const predictionMap: any =
        {};

      const guessMap: any = {};

      for (const match of matchesData) {
        const prediction =
          await getPrediction(
            user.id,
            match.id
          );

        if (prediction) {
          predictionMap[
            match.id
          ] = prediction;

          guessMap[match.id] = {
            homeGuess:
              prediction.homeGuess,
            awayGuess:
              prediction.awayGuess,
          };
        } else {
          guessMap[match.id] = {
            homeGuess: 0,
            awayGuess: 0,
          };
        }
      }

      setPredictions(
        predictionMap
      );

      setGuesses(guessMap);

      const rankingData =
        await getRanking();

      setRanking(rankingData);
    }

    loadData();
  }, []);

  async function handleSavePrediction(
    matchId: string
  ) {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) return;

    const user =
      JSON.parse(storedUser!);

    const currentGuess =
      guesses[matchId];

    // 🇧🇷 Anti-zica
if (
  currentGuess.homeGuess <=
  currentGuess.awayGuess
) {
  const confirmed =
    confirm(
      `🚨 ALERTA DE TRAÍRA 🚨

Você está apostando contra o Brasil 😡🇧🇷

Tem CERTEZA disso?

A seleção vai lembrar...`
    );

  if (!confirmed) {
    return;
  }
}
const savedPrediction =
  await savePrediction({
    userId: user.id,
    matchId,
    homeGuess:
      currentGuess.homeGuess,
    awayGuess:
      currentGuess.awayGuess,
  });

// 🚫 placar já lotado
if (
  "error" in savedPrediction &&
  savedPrediction.error
) {
  alert(
    `🚫 Esse placar já foi escolhido 2x

Quem pegou:

${savedPrediction.users.join(
  "\n"
)}

Escolha outro 😎`
  );

  return;
}

setPredictions(
  (prev: any) => ({
    ...prev,
    [matchId]:
      savedPrediction,
  })
);

alert("Palpite salvo 😎");

    setPredictions(
      (prev: any) => ({
        ...prev,
        [matchId]:
          savedPrediction,
      })
    );

    alert("Palpite salvo 😎");

    const rankingData =
      await getRanking();

    setRanking(rankingData);
  }

  if (!matches.length) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <h1 className="text-xl animate-pulse">
          Carregando...
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🇧🇷 Bora Brasil
        </h1>

        <div className="space-y-6">
          {matches.map((match) => {
            const bettingClosed =
              new Date() >
              new Date(
                match.startsAt
              );

            const guess =
              guesses[
                match.id
              ] || {
                homeGuess: 0,
                awayGuess: 0,
              };

            const prediction =
              predictions[
                match.id
              ];

            return (
              <div
                key={match.id}
                className="bg-zinc-800 p-8 rounded-xl shadow-2xl"
              >
                <h1 className="text-4xl font-bold text-center">
                  {
                    match.homeTeam
                  }
                </h1>

                <p className="text-zinc-400 text-center my-4 font-semibold">
                  VS
                </p>

                <h2 className="text-4xl font-bold text-center">
                  {
                    match.awayTeam
                  }
                </h2>

                <p className="text-zinc-400 text-center mt-4">
                  {new Date(
                    match.startsAt
                  ).toLocaleString(
                    "pt-BR"
                  )}
                </p>

                <div className="flex justify-center items-center gap-4 mt-8">
                  <input
                    type="number"
                    disabled={
                      bettingClosed
                    }
                    value={
                      guess.homeGuess
                    }
                    onChange={(e) =>
                      setGuesses(
                        (
                          prev: any
                        ) => ({
                          ...prev,
                          [match.id]:
                            {
                              ...guess,
                              homeGuess:
                                Number(
                                  e
                                    .target
                                    .value
                                ),
                            },
                        })
                      )
                    }
                    className="w-20 p-3 rounded bg-zinc-700 text-center text-2xl font-bold"
                  />

                  <span className="text-3xl text-zinc-500">
                    x
                  </span>

                  <input
                    type="number"
                    disabled={
                      bettingClosed
                    }
                    value={
                      guess.awayGuess
                    }
                    onChange={(e) =>
                      setGuesses(
                        (
                          prev: any
                        ) => ({
                          ...prev,
                          [match.id]:
                            {
                              ...guess,
                              awayGuess:
                                Number(
                                  e
                                    .target
                                    .value
                                ),
                            },
                        })
                      )
                    }
                    className="w-20 p-3 rounded bg-zinc-700 text-center text-2xl font-bold"
                  />
                </div>

                <button
                  onClick={() =>
                    handleSavePrediction(
                      match.id
                    )
                  }
                  disabled={
                    bettingClosed
                  }
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
                      <div className="mt-6 text-left">
        <h3 className="font-bold text-yellow-400 mb-2">
          🔥 Placares escolhidos
        </h3>

        <div className="space-y-2">
          {Object.entries(
            usedPredictions[
              match.id
            ] || {}
          ).map(
            (
              [score, users]: any
            ) => (
              <div
                key={score}
                className="bg-zinc-700 rounded-lg p-2 flex justify-between items-center"
              >
                <span className="font-bold">
                  {score}
                </span>

                <div className="text-sm text-zinc-300 text-right">
                  {users.join(
                    ", "
                  )}

                  {users.length >=
                    2 && (
                    <span className="ml-2 text-red-400 font-bold">
                      🔒
                    </span>
                  )}
                </div>
              </div>
            )
          )}

          {Object.keys(
            usedPredictions[
              match.id
            ] || {}
          ).length ===
            0 && (
            <p className="text-zinc-500 text-sm">
              Ninguém apostou ainda 👀
            </p>
          )}
        </div>
      </div>

                {prediction && (
                  <div className="mt-6 bg-zinc-700 rounded-xl p-4">
                    <p className="text-zinc-400 text-sm">
                      Seu palpite
                    </p>

                    <h2 className="text-2xl font-bold text-green-400">
                      {
                        prediction.homeGuess
                      }{" "}
                      x{" "}
                      {
                        prediction.awayGuess
                      }
                    </h2>

                    {match.finished && (
                      <div className="mt-4 border-t border-zinc-600 pt-4">
                        <p className="text-zinc-400">
                          Resultado
                          oficial
                        </p>

                        <h3 className="text-2xl font-bold">
                          {
                            match.homeScore
                          }{" "}
                          x{" "}
                          {
                            match.awayScore
                          }
                        </h3>

                        <p className="text-yellow-400 font-bold mt-2">
                          Você
                          ganhou{" "}
                          {prediction.points ||
                            0}{" "}
                          pts 🏆
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-zinc-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">
            🏆 Ranking
          </h2>

          <div className="space-y-2">
            {ranking.map(
              (
                player,
                index
              ) => (
                <div
                  key={
                    player.id
                  }
                  className="bg-zinc-700 rounded-lg p-3 flex justify-between"
                >
                  <span>
                    {index === 0
                      ? "🥇"
                      : index ===
                        1
                      ? "🥈"
                      : index ===
                        2
                      ? "🥉"
                      : `${
                          index +
                          1
                        }º`}{" "}
                    {
                      player.username
                    }
                  </span>

                  <span>
                    {
                      player.points
                    }{" "}
                    pts
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}