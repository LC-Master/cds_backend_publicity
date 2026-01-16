import Elysia from "elysia";
import { SyncService } from "../services/sync.service";
import { transporter } from "../providers/transporter.provider";

export const testRoute = new Elysia()
  .get("/dto", async () => {
    const dto = await SyncService.syncData();
    return dto;
  })
  .get("/mailer-test", async () => {
    await transporter.sendMail({
      from: "Tester",
      to: "1l1",
      subject: "Test Email",
      text: "This is a test email from the backend checker application.",
    });
    return { message: "Test email sent successfully" };
  });
