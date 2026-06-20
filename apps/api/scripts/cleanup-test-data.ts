// Force test-DB routing before prisma.ts (via env.ts) resolves a connection
// string — this script must never be able to delete from the production DB,
// regardless of how NODE_ENV is set in the invoking shell.
process.env.NODE_ENV = "test";

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  await prisma.attendance.deleteMany({ where: { session: { qrToken: { startsWith: "test-token-" } } } });
  await prisma.attendance.deleteMany({ where: { session: { qrToken: { startsWith: "expired-token-" } } } });
  await prisma.session.deleteMany({ where: { qrToken: { startsWith: "test-token-" } } });
  await prisma.session.deleteMany({ where: { qrToken: { startsWith: "expired-token-" } } });
  await prisma.eventType.deleteMany({ where: { name: "Sunday School" } });
  await prisma.member.deleteMany({ where: { phoneNumber: "+2348012346789" } });
  await prisma.admin.deleteMany({ where: { name: "Test Admin" } });

  console.log("cleaned up");
  return prisma;
}

main().then((prisma) => prisma.$disconnect());
