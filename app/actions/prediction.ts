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

  if (existingPrediction) {
    return prisma.prediction.update({
      where: {
        id: existingPrediction.id,
      },
      data: {
        homeGuess: data.homeGuess,
        awayGuess: data.awayGuess,
      },
    });
  }

  return prisma.prediction.create({
    data,
  });
}