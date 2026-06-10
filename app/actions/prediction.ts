"use server";

import { prisma } from "../../lib/prisma";

type PredictionData = {
  userId: string;
  matchId: string;
  homeGuess: number;
  awayGuess: number;
};

export async function savePrediction(
  data: PredictionData
) {
  const existingPrediction =
    await prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId: data.userId,
          matchId: data.matchId,
        },
      },
    });

  // verifica quem já escolheu
  const samePredictions =
    await prisma.prediction.findMany({
      where: {
        matchId: data.matchId,
        homeGuess:
          data.homeGuess,
        awayGuess:
          data.awayGuess,
      },
      include: {
        user: true,
      },
    });

  // impede mais de 2 pessoas
  // MAS permite a própria pessoa editar
  const otherUsers =
    samePredictions.filter(
      (prediction) =>
        prediction.userId !==
        data.userId
    );

  if (otherUsers.length >= 2) {
    return {
      error: true,
      message:
        "Esse placar já foi escolhido 2x",
      users:
        otherUsers.map(
          (prediction) =>
            prediction.user
              .username
        ),
    };
  }

  // editar palpite existente
  if (existingPrediction) {
    return prisma.prediction.update({
      where: {
        id:
          existingPrediction.id,
      },
      data: {
        homeGuess:
          data.homeGuess,
        awayGuess:
          data.awayGuess,
      },
    });
  }

  // criar novo
  return prisma.prediction.create({
    data,
  });
}