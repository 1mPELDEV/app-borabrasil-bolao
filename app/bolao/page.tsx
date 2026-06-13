"use client";

import { useEffect, useState } from "react";
import { getMatches } from "../actions/match";
import { savePrediction } from "../actions/prediction";
import { getRanking } from "../actions/ranking";
import { getPrediction } from "../actions/get-prediction";
import { getUsedPredictions } from "../actions/get-used-predictions";

type Tab = "jogos" | "ranking";

const TEAM_FLAGS: Record<string, string> = {
  Brasil: "https://flagcdn.com/w80/br.png",
  Marrocos: "https://flagcdn.com/w80/ma.png",
};

function getFlag(teamName: string): string | null {
  for (const key of Object.keys(TEAM_FLAGS)) {
    if (teamName.includes(key)) return TEAM_FLAGS[key];
  }
  return null;
}

export default function BolaoPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  const [usedPredictions, setUsedPredictions] = useState<any>({});
  const [guesses, setGuesses] = useState<any>({});
  const [activeTab, setActiveTab] = useState<Tab>("jogos");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadUsedPredictions(matchesData: any[]) {
    const usedMap: any = {};
    for (const match of matchesData) {
      usedMap[match.id] = await getUsedPredictions(match.id);
    }
    setUsedPredictions(usedMap);
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/";
      return;
    }

    async function loadData() {
      const user = JSON.parse(storedUser!);
      const matchesData = await getMatches();
      setMatches(matchesData);
      await loadUsedPredictions(matchesData);

      const predictionMap: any = {};
      const guessMap: any = {};

      for (const match of matchesData) {
        const prediction = await getPrediction(user.id, match.id);
        if (prediction) {
          predictionMap[match.id] = prediction;
          guessMap[match.id] = {
            homeGuess: prediction.homeGuess,
            awayGuess: prediction.awayGuess,
          };
        } else {
          guessMap[match.id] = { homeGuess: 0, awayGuess: 0 };
        }
      }

      setPredictions(predictionMap);
      setGuesses(guessMap);
      setRanking(await getRanking());
    }

    loadData();
  }, []);

  async function handleSavePrediction(matchId: string) {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser!);
    const currentGuess = guesses[matchId];
    const match = matches.find((m) => m.id === matchId);

    if (match) {
      const brasilIsHome = match.homeTeam.includes("Brasil");
      const brasilIsAway = match.awayTeam.includes("Brasil");
      let bettingAgainstBrazil = false;

      if (brasilIsHome) bettingAgainstBrazil = currentGuess.awayGuess > currentGuess.homeGuess;
      if (brasilIsAway) bettingAgainstBrazil = currentGuess.homeGuess > currentGuess.awayGuess;

      if (bettingAgainstBrazil) {
        const confirmed = confirm(
          `🚨 ALERTA DE JUDAS 🚨\n\nVocê está apostando contra o Brasil 😡🇧🇷\n\nTem CERTEZA disso?\n\n Safado(a)!... 👀`
        );
        if (!confirmed) return;
      }
    }

    setSavingId(matchId);

    const savedPrediction = await savePrediction({
      userId: user.id,
      matchId,
      homeGuess: currentGuess.homeGuess,
      awayGuess: currentGuess.awayGuess,
    });

    setSavingId(null);

    if ("error" in savedPrediction && savedPrediction.error) {
      alert(`🚫 Esse placar já foi escolhido 2x\n\nQuem pegou:\n${savedPrediction.users.join("\n")}\n\nEscolha outro 😎`);
      return;
    }

    setPredictions((prev: any) => ({ ...prev, [matchId]: savedPrediction }));
    await loadUsedPredictions(matches);
    setRanking(await getRanking());
  }

  function step(matchId: string, side: "homeGuess" | "awayGuess", delta: number) {
    setGuesses((prev: any) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: Math.max(0, (prev[matchId]?.[side] ?? 0) + delta),
      },
    }));
  }

  if (!matches.length) {
    return (
      <main className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#009c3b] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Carregando partidas...</p>
        </div>
      </main>
    );
  }

  const now = new Date();

  const liveMatch = matches.find(
    (m) => now > new Date(m.startsAt) && !m.finished
  );

  const nextMatch = matches
    .filter((m) => now <= new Date(m.startsAt))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const featuredMatch = liveMatch ?? nextMatch;
  const featuredId = featuredMatch?.id;

  const otherMatches = matches.filter((m) => m.id !== featuredId);

  const podiumIcon = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}º`;
  };

  const avatarClass = (i: number) => {
    if (i === 0) return "bg-yellow-400/10 text-yellow-400";
    if (i === 1) return "bg-slate-400/10 text-slate-400";
    if (i === 2) return "bg-orange-500/10 text-orange-400";
    return "bg-white/5 text-slate-500";
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <main className="min-h-screen bg-[#0a1628] text-slate-200 pb-12">

      {/* ── Header ── */}
      <header className="relative bg-gradient-to-br from-[#063d1e] to-[#0a1628] border-b-2 border-[#009c3b] px-5 pt-6 pb-5 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,156,59,0.18),transparent_65%)] pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 bg-[#009c3b]/15 border border-[#009c3b]/40 rounded-full px-4 py-1 text-[11px] font-semibold text-green-400 tracking-widest uppercase mb-3">
          <span>🏆</span> Copa do Mundo 2026
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight">
          Bolão <span className="text-yellow-400">Brasil</span> 🇧🇷
        </h1>
        <p className="text-slate-500 text-sm mt-1">Aposte no placar — ganhe glória eterna</p>

        <div className="flex justify-center gap-0.5 mt-4">
          <div className="h-1 w-12 rounded-full bg-[#009c3b]" />
          <div className="h-1 w-7 rounded-full bg-[#ffdf00]" />
          <div className="h-1 w-12 rounded-full bg-[#002776]" />
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav className="flex bg-[#0f1f3a] border-b border-white/5 px-4">
        {(["jogos", "ranking"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab === "jogos" ? "⚽" : "🏆"} {tab}
          </button>
        ))}
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-4">

        {/* ══════════════ JOGOS ══════════════ */}
        {activeTab === "jogos" && (
          <div>
            {featuredMatch && (
              <>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
                  {liveMatch ? "🔴 Ao vivo" : "⏭ Próximo jogo"}
                </p>
                <MatchCard
                  match={featuredMatch}
                  guess={guesses[featuredId] || { homeGuess: 0, awayGuess: 0 }}
                  prediction={predictions[featuredId]}
                  usedPredictions={usedPredictions[featuredId] || {}}
                  isSaving={savingId === featuredId}
                  onStep={step}
                  onSave={handleSavePrediction}
                  locked={!!liveMatch}
                  isCurrent={true}
                />
              </>
            )}

            {otherMatches.length > 0 && (
              <>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mt-6 mb-3">
                  Outros jogos
                </p>
                <div className="space-y-3">
                  {otherMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      guess={guesses[match.id] || { homeGuess: 0, awayGuess: 0 }}
                      prediction={predictions[match.id]}
                      usedPredictions={usedPredictions[match.id] || {}}
                      isSaving={false}
                      onStep={step}
                      onSave={handleSavePrediction}
                      locked={true}
                      isCurrent={false}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════ RANKING ══════════════ */}
        {activeTab === "ranking" && (
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
              Classificação geral
            </p>

            <div className="bg-[#0f1f3a] border border-white/5 rounded-xl overflow-hidden mb-6">
              {ranking.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">Ninguém pontuou ainda 👀</p>
              )}
              {ranking.map((player, i) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 ${
                    i === 0 ? "bg-yellow-400/5" : i === 1 ? "bg-slate-400/[0.03]" : i === 2 ? "bg-orange-500/[0.04]" : ""
                  }`}
                >
                  <div className="w-7 text-center text-base">{podiumIcon(i)}</div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarClass(i)}`}>
                    {initials(player.username)}
                  </div>
                  <div className="flex-1 text-sm font-medium">{player.username}</div>
                  <div className={`text-lg font-bold ${i === 0 ? "text-yellow-400" : i <= 2 ? "text-slate-300" : "text-slate-500"}`}>
                    {player.points}
                    <span className="text-xs font-normal text-slate-500 ml-0.5">pts</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
              Pontuação
            </p>
            <div className="bg-[#0f1f3a] border border-white/5 rounded-xl divide-y divide-white/5">
              {[
                { icon: "🎯", label: "Placar exato", desc: "Acertou o resultado certinho", pts: 25 },
                { icon: "✅", label: "Vencedor certo", desc: "Acertou quem ganhou", pts: 10 },
                { icon: "🤝", label: "Empate certo", desc: "Chutou empate e deu empate", pts: 8 },
              ].map(({ icon, label, desc, pts }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <span className="text-base font-bold text-yellow-400">+{pts} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 px-4">
        <div className="max-w-2xl mx-auto border-t border-white/5 pt-5 text-center">
          <p className="text-xs text-slate-500">
            By{" "}
            <span className="text-green-400 font-semibold">Pedro Felipe</span>
            <span className="text-xs text-slate-500"> - Software Developer</span>
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ─────────────────────────────────────────────
   TeamFlag — exibe bandeira via flagcdn ou emoji fallback
───────────────────────────────────────────── */
function TeamFlag({ teamName }: { teamName: string }) {
  const src = getFlag(teamName);
  if (src) {
    return (
      <img
        src={src}
        alt={`Bandeira ${teamName}`}
        className="w-10 h-7 object-cover rounded shadow-sm"
      />
    );
  }
  return <div className="text-2xl">🏴</div>;
}

/* ─────────────────────────────────────────────
   MatchCard — componente interno
───────────────────────────────────────────── */
function MatchCard({
  match,
  guess,
  prediction,
  usedPredictions,
  isSaving,
  onStep,
  onSave,
  locked,
  isCurrent,
}: {
  match: any;
  guess: any;
  prediction: any;
  usedPredictions: any;
  isSaving: boolean;
  onStep: (id: string, side: "homeGuess" | "awayGuess", delta: number) => void;
  onSave: (id: string) => void;
  locked: boolean;
  isCurrent: boolean;
}) {
  const usedEntries = Object.entries(usedPredictions) as [string, string[]][];

  const cardBorder = isCurrent
    ? "border-[#009c3b]/60 shadow-[0_0_24px_rgba(0,156,59,0.15)]"
    : locked
    ? "border-white/5 opacity-50 grayscale-[30%]"
    : "border-white/5 hover:border-yellow-400/20";

  return (
    <div className={`bg-[#0f1f3a] border rounded-xl overflow-hidden transition-all ${cardBorder}`}>

      {/* Badge — só aparece no isCurrent */}
      {isCurrent && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#009c3b]/10 border-b border-[#009c3b]/30">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#009c3b] animate-pulse" />
          <span className="text-[11px] font-bold text-[#009c3b] uppercase tracking-widest">
            {locked ? "🔴 Ao vivo — apostas encerradas" : "⏭ Próximo jogo — aposte agora"}
          </span>
        </div>
      )}

      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/5">
        <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wide">
          {match.stage || "Fase de Grupos"}
        </span>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          {locked && !isCurrent && new Date() > new Date(match.startsAt) && !match.finished && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1" />
          )}
          {new Date(match.startsAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="px-4 pt-4 pb-2">
        {/* Times */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
          <div className="flex flex-col items-center gap-1.5">
            <TeamFlag teamName={match.homeTeam} />
            <p className="text-sm font-semibold text-center leading-tight">{match.homeTeam}</p>
          </div>
          <div className="text-xs text-slate-600 font-bold tracking-widest">VS</div>
          <div className="flex flex-col items-center gap-1.5">
            <TeamFlag teamName={match.awayTeam} />
            <p className="text-sm font-semibold text-center leading-tight">{match.awayTeam}</p>
          </div>
        </div>

        {/* Stepper de placar — só aparece se não bloqueado */}
        {!locked && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <ScoreStepper
              label={match.homeTeam}
              value={guess.homeGuess}
              onMinus={() => onStep(match.id, "homeGuess", -1)}
              onPlus={() => onStep(match.id, "homeGuess", 1)}
            />
            <span className="text-slate-600 font-bold text-lg">×</span>
            <ScoreStepper
              label={match.awayTeam}
              value={guess.awayGuess}
              onMinus={() => onStep(match.id, "awayGuess", -1)}
              onPlus={() => onStep(match.id, "awayGuess", 1)}
            />
          </div>
        )}

        {/* Resultado oficial (jogo finalizado) */}
        {match.finished && (
          <div className="flex justify-center mb-4">
            <div className="bg-white/5 rounded-lg px-5 py-2 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Resultado oficial</p>
              <p className="text-2xl font-bold text-white">
                {match.homeScore} × {match.awayScore}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botão salvar */}
      {!locked && (
        <div className="px-4 pb-3">
          <button
            onClick={() => onSave(match.id)}
            disabled={isSaving}
            className="w-full py-2.5 rounded-lg bg-[#009c3b] hover:bg-[#00b844] active:scale-[0.98] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>💾 Salvar palpite</>
            )}
          </button>
        </div>
      )}

      {/* Encerrado */}
      {locked && !isCurrent && (
        <div className="px-4 pb-3">
          <div className="w-full py-2.5 rounded-lg bg-white/5 text-slate-600 text-sm font-bold text-center">
            🔒 Apostas encerradas
          </div>
        </div>
      )}

      {/* Seu palpite salvo */}
      {prediction && (
        <div className="mx-4 mb-3 bg-yellow-400/8 border border-yellow-400/20 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Seu palpite</p>
            <p className="text-xl font-bold text-yellow-400">
              {prediction.homeGuess} × {prediction.awayGuess}
            </p>
          </div>
          {match.finished && (
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Pontos</p>
              <p className="text-xl font-bold text-green-400">+{prediction.points || 0}</p>
            </div>
          )}
        </div>
      )}

      {/* Placares tomados */}
      {usedEntries.length > 0 && (
        <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Placares tomados</p>
          <div className="flex flex-wrap gap-1.5">
            {usedEntries.map(([score, users]) => {
              const full = users.length >= 2;
              return (
                <div
                  key={score}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
                    full
                      ? "bg-red-500/10 border border-red-500/25 text-red-300"
                      : "bg-white/5 border border-white/8 text-slate-400"
                  }`}
                >
                  <span className={`font-bold ${full ? "text-red-300" : "text-slate-300"}`}>{score}</span>
                  <span>{(users as string[]).join(", ")}</span>
                  {full && <span>🔒</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ScoreStepper — botões +/− com valor
───────────────────────────────────────────── */
function ScoreStepper({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-slate-500 uppercase tracking-wide truncate max-w-[72px] text-center">
        {label}
      </span>
      <div className="flex items-center bg-[#162033] border border-white/10 rounded-lg overflow-hidden">
        <button
          onClick={onMinus}
          className="w-8 h-11 flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-yellow-400 transition-colors text-lg font-bold"
        >
          −
        </button>
        <span className="w-10 h-11 flex items-center justify-center text-xl font-bold text-white border-x border-white/[0.07]">
          {value}
        </span>
        <button
          onClick={onPlus}
          className="w-8 h-11 flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-yellow-400 transition-colors text-lg font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
