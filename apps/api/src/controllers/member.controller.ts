import type { Request, Response } from "express";
import * as memberService from "../services/member.service";
import { serializeMemberLookup } from "../lib/serializers";

export async function lookupByPhone(req: Request, res: Response) {
  const phone = typeof req.query.phone === "string" ? req.query.phone : "";
  const member = await memberService.lookupMemberByPhone(phone);
  res.json({ success: true, data: serializeMemberLookup(member) });
}

export async function linkDevice(req: Request, res: Response) {
  const phoneNumber = typeof req.body?.phone_number === "string" ? req.body.phone_number : "";
  const deviceToken = await memberService.linkDevice(req.params.id as string, phoneNumber);
  res.json({ success: true, data: { device_token: deviceToken } });
}
