"use server";

import { prisma } from "../../lib/prisma";

// 1. Criamos a estrutura exata do que a Prediction e o User têm no banco
interface Prediction {
  points?: number | null;
}

interface PrismaUser {
  id: string | number;
  username?: string | null;
  name?: string | null;
  predictions: Prediction[];
}

// 2. Criamos o tipo do objeto que vai para a lista do ranking
interface RankingItem {
  id: string | number;
  username: string;
  points: number;
}

export async function getRanking() {
  // Buscamos os dados do Prisma e dizemos ao TypeScript para tratá-los como nossa interface
  const users = await prisma.user.findMany({
    include: {
      predictions: true,
    },
  }) as unknown as PrismaUser[];

  // O TypeScript agora sabe exatamente o que é o 'user' e a 'prediction'
  const ranking: RankingItem[] = users.map((user) => {
    const totalPoints = user.predictions.reduce(
      (sum: number, prediction: Prediction) => sum + (prediction.points || 0),
      0
    );

    return {
      id: user.id,
      username: user.username || user.name || "Usuário",
      points: totalPoints,
    };
  });

  // Como o TypeScript sabe que 'a' e 'b' são do tipo 'RankingItem', ele aceita o '.points' sem reclamar!
  ranking.sort((a: RankingItem, b: RankingItem) => b.points - a.points);

  return ranking;
}