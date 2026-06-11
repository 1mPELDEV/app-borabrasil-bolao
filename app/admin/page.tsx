"use client";

import { useEffect, useState } from "react";
import {
  createMatch,
  getMatches,
  deleteMatch,
} from "../actions/admin";

import {
  getUsers,
  deleteUser,
} from "../actions/user";

import { finishMatch } from "../actions/match";

export default function AdminPage() {
  const [matches, setMatches] =
    useState<any[]>([]);

  const [users, setUsers] =
    useState<any[]>([]);

  const [awayTeam, setAwayTeam] =
    useState("");

  const [startsAt, setStartsAt] =
    useState("");

  const [homeScore, setHomeScore] =
    useState(0);

  const [awayScore, setAwayScore] =
    useState(0);

  async function loadMatches() {
    const data =
      await getMatches();

    setMatches(data);
  }

  async function loadUsers() {
    const data =
      await getUsers();

    setUsers(data);
  }

  useEffect(() => {
    loadMatches();
    loadUsers();
  }, []);

  async function handleCreateMatch() {
    if (!awayTeam || !startsAt)
      return;

    await createMatch({
      awayTeam,
      startsAt,
    });

    setAwayTeam("");
    setStartsAt("");

    await loadMatches();

    alert("Jogo criado 😎");
  }

  async function handleDelete(
    matchId: string
  ) {
    await deleteMatch(matchId);

    await loadMatches();

    alert("Jogo deletado 😈");
  }

  async function handleDeleteUser(
    userId: string,
    username: string
  ) {
    const confirmed =
      confirm(
        `Excluir ${username}?

Todos os palpites serão apagados também.`
      );

    if (!confirmed) return;

    await deleteUser(
      userId
    );

    await loadUsers();

    alert(
      "Usuário removido 😎"
    );
  }

  async function handleFinish(
    matchId: string
  ) {
    await finishMatch(
      matchId,
      homeScore,
      awayScore
    );

    await loadMatches();

    alert(
      "Jogo finalizado 🏆"
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Painel Admin ⚙️
        </h1>

        {/* NOVO JOGO */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Novo jogo
          </h2>

          <input
            type="text"
            placeholder="Adversário"
            value={awayTeam}
            onChange={(e) =>
              setAwayTeam(
                e.target.value
              )
            }
            className="w-full p-3 rounded bg-zinc-700 mb-4"
          />

          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) =>
              setStartsAt(
                e.target.value
              )
            }
            className="w-full p-3 rounded bg-zinc-700 mb-4"
          />

          <button
            onClick={
              handleCreateMatch
            }
            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold"
          >
            Criar jogo
          </button>
        </div>

        {/* PARTICIPANTES */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            👥 Participantes
          </h2>

          <div className="space-y-3">
            {users.length ===
            0 ? (
              <p className="text-zinc-400">
                Nenhum participante
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="bg-zinc-700 rounded-lg p-3 flex justify-between items-center"
                >
                  <span>
                    {user.username}
                  </span>

                  <button
                    onClick={() =>
                      handleDeleteUser(
                        user.id,
                        user.username
                      )
                    }
                    className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded font-bold"
                  >
                    ❌ Excluir
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* JOGOS */}
        <div className="space-y-4">
          {matches.map(
            (match) => (
              <div
                key={match.id}
                className="bg-zinc-800 rounded-xl p-5"
              >
                <h2 className="text-2xl font-bold">
                  {match.homeTeam} x{" "}
                  {match.awayTeam}
                </h2>

                <p className="text-zinc-400 mt-2">
                  {new Date(
                    match.startsAt
                  ).toLocaleString(
                    "pt-BR"
                  )}
                </p>

                {match.finished ? (
                  <div className="mt-4">
                    <p className="text-green-400 font-bold text-lg mb-4">
                      🏆 Finalizado:{" "}
                      {match.homeScore} x{" "}
                      {match.awayScore}
                    </p>

                    <button
                      onClick={() =>
                        handleDelete(
                          match.id
                        )
                      }
                      className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold"
                    >
                      🗑️ Excluir jogo
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="flex gap-2 mb-4">
                      <input
                        type="number"
                        placeholder="Brasil"
                        onChange={(e) =>
                          setHomeScore(
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                        className="w-24 p-2 rounded bg-zinc-700"
                      />

                      <input
                        type="number"
                        placeholder={
                          match.awayTeam
                        }
                        onChange={(e) =>
                          setAwayScore(
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                        className="w-24 p-2 rounded bg-zinc-700"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleFinish(
                            match.id
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
                      >
                        🏆 Finalizar
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            match.id
                          )
                        }
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
                      >
                        ❌ Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}