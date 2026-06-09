"use server";

import { prisma } from "../../lib/prisma";

export async function seedMatch() {
  const existingMatch =
    await prisma.match.findFirst();

  if (existingMatch) {
    return existingMatch;
  }

  const match =
    await prisma.match.create({
      data: {
        homeTeam: "Brasil 🇧🇷",
        awayTeam: "Argentina 🇦🇷",
        startsAt: new Date(
          "2026-06-20T20:00:00"
        ),
      },
    });

  return match;
}

export async function getMatch() {
  const match =
    await prisma.match.findFirst();

  return match;
}

export async function getMatches() {
  const matches =
    await prisma.match.findMany({
      orderBy: {
        startsAt: "asc",
      },
    });

  return matches;
}

export async function finishMatch(
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const match =
    await prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        homeScore,
        awayScore,
        finished: true,
      },
    });

  const predictions =
    await prisma.prediction.findMany({
      where: {
        matchId,
      },
    });

  for (const prediction of predictions) {
    let points = 0;

    const exactScore =
      prediction.homeGuess ===
        homeScore &&
      prediction.awayGuess ===
        awayScore;

    const realWinner =
      homeScore > awayScore
        ? "home"
        : awayScore > homeScore
        ? "away"
        : "draw";

    const guessedWinner =
      prediction.homeGuess >
      prediction.awayGuess
        ? "home"
        : prediction.awayGuess >
          prediction.homeGuess
        ? "away"
        : "draw";

    if (exactScore) {
      points = 10;
    } else if (
      realWinner === guessedWinner
    ) {
      points = 5;
    }

    await prisma.prediction.update({
      where: {
        id: prediction.id,
      },
      data: {
        points,
      },
    });
  }

  return match;
}