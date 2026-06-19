import cors from "cors";
import express from "express";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/errorHandler";
import { healthRouter } from "./routes/health";
import { checkinRouter } from "./routes/checkin";
import { membersRouter } from "./routes/members";
import { adminRouter } from "./routes/admin";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

app.use(healthRouter);
app.use("/api/v1", checkinRouter);
app.use("/api/v1", membersRouter);
app.use("/api/v1", adminRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT}`);
});
