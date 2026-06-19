import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";

export async function lookupMemberByPhone(phone: string) {
  if (!phone) {
    throw new HttpError(400, "phone query parameter is required.");
  }

  const member = await prisma.member.findUnique({ where: { phoneNumber: phone } });
  if (!member) {
    throw new HttpError(404, "Member not found.");
  }

  return member;
}

export async function linkDevice(memberId: string, phoneNumber: string) {
  if (!phoneNumber) {
    throw new HttpError(400, "phone_number is required.");
  }

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    throw new HttpError(404, "Member not found.");
  }

  if (member.phoneNumber !== phoneNumber) {
    throw new HttpError(403, "Phone number does not match this member record.");
  }

  const deviceToken = randomUUID();
  const updated = await prisma.member.update({
    where: { id: memberId },
    data: { deviceToken },
  });

  return updated.deviceToken;
}
