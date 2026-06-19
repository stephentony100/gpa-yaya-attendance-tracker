import type { Request, Response } from "express";
import * as checkinService from "../services/checkin.service";
import { serializeMemberPublic, serializeSessionPublic } from "../lib/serializers";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getCheckin(req: Request, res: Response) {
  const session = await checkinService.getOpenSession(req.params.qr_token as string);
  res.json({ success: true, data: serializeSessionPublic(session) });
}

export async function register(req: Request, res: Response) {
  const { member, attendance, session, deviceToken } = await checkinService.registerMember(
    req.params.qr_token as string,
    req.body
  );

  res.status(201).json({
    success: true,
    data: {
      member: serializeMemberPublic(member),
      device_token: deviceToken,
      attendance: { id: attendance.id, marked_at: attendance.markedAt },
      session: serializeSessionPublic(session),
    },
    message: `Welcome, ${member.fullName} — you're marked present for ${session.eventType.name}, ${formatDate(session.date)}.`,
  });
}

export async function mark(req: Request, res: Response) {
  const deviceToken = req.header("X-Device-Token") ?? "";
  const { member, session, attendance, alreadyMarked } = await checkinService.markAttendance(
    req.params.qr_token as string,
    deviceToken
  );

  const data = {
    member: serializeMemberPublic(member),
    session: serializeSessionPublic(session),
    attendance: { id: attendance.id, marked_at: attendance.markedAt },
    already_marked: alreadyMarked,
  };

  if (alreadyMarked) {
    res.status(200).json({
      success: true,
      data,
      message: "You're already marked present.",
    });
    return;
  }

  res.status(201).json({
    success: true,
    data,
    message: `Welcome back, ${member.fullName} — you're marked present for ${session.eventType.name}, ${formatDate(session.date)}.`,
  });
}
