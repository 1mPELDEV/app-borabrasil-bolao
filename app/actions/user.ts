"use server";

import { prisma } from "../../lib/prisma";

export async function createUser(username: string) {
  console.log(process.env.DATABASE_URL);

  if (!username.trim()) return;

  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  const user = await prisma.user.create({
    data: {
      username,
    },
  });

  return user;
}