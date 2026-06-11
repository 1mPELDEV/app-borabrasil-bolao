"use server";

import { prisma } from "../../lib/prisma";

type CreateMatchProps = {
  awayTeam: string;
  startsAt: string;
};

export async function createMatch({
  awayTeam,
  startsAt,
}: CreateMatchProps) {
  const match =
    await prisma.match.create({
      data: {
        homeTeam: "Brasil 🇧🇷",
        awayTeam,
        startsAt: new Date(
          startsAt
        ),
      },
    });

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

export async function deleteMatch(
  matchId: string
) {
  // apaga todos os palpites
  // ligados ao jogo
  await prisma.prediction.deleteMany({
    where: {
      matchId,
    },
  });

  // depois apaga o jogo
  await prisma.match.delete({
    where: {
      id: matchId,
    },
  });

  return {
    success: true,
  };
}