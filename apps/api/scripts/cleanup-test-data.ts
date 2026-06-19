import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.attendance.deleteMany({
    where: { session: { qrToken: { in: ["test-token-123", "expired-token-456"] } } },
  });
  await prisma.session.deleteMany({
    where: { qrToken: { in: ["test-token-123", "expired-token-456"] } },
  });
  await prisma.eventType.deleteMany({ where: { name: "Sunday School" } });
  await prisma.member.deleteMany({ where: { phoneNumber: "+2348012346789" } });
  await prisma.admin.deleteMany({ where: { name: "Test Admin" } });
  console.log("cleaned up");
}

main().finally(() => prisma.$disconnect());
