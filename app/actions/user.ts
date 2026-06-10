"use server";

import { prisma } from "../../lib/prisma";

export async function createUser(
  username: string
) {
  if (!username.trim()) return;

  const existingUser =
    await prisma.user.findUnique({
      where: {
        username,
      },
    });

  if (existingUser) {
    return existingUser;
  }

  const user =
    await prisma.user.create({
      data: {
        username,
      },
    });

  return user;
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: {
      username: "asc",
    },
  });
}

export async function deleteUser(
  userId: string
) {
  // remove palpites
  await prisma.prediction.deleteMany({
    where: {
      userId,
    },
  });

  // remove usuário
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    success: true,
  };
}