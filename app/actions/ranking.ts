"use server";

import { prisma } from "../../lib/prisma";

export async function getRanking() {
  const users =
    await prisma.user.findMany({
      include: {
        predictions: true,
      },
    });

  const ranking = users.map(
    (user) => {
      const totalPoints =
        user.predictions.reduce(
          (sum, prediction) =>
            sum + prediction.points,
          0
        );

      return {
        id: user.id,
        username: user.username,
        points: totalPoints,
      };
    }
  );

  ranking.sort(
    (a, b) => b.points - a.points
  );

  return ranking;
}