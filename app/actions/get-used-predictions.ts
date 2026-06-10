"use server";

import { prisma } from "../../lib/prisma";

export async function getUsedPredictions(
  matchId: string
) {
  const predictions =
    await prisma.prediction.findMany({
      where: {
        matchId,
      },
      include: {
        user: true,
      },
      orderBy: {
        homeGuess: "asc",
      },
    });

  const grouped =
    predictions.reduce(
      (acc: any, prediction) => {
        const key =
          `${prediction.homeGuess}x${prediction.awayGuess}`;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(
          prediction.user
            .username
        );

        return acc;
      },
      {}
    );

  return grouped;
}