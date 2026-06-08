"use server";

import { prisma } from "../../lib/prisma";

export async function getPrediction(
  userId: string,
  matchId: string
) {
  const prediction =
    await prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId,
          matchId,
        },
      },
    });

  return prediction;
}