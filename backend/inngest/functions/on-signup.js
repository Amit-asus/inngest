import inngest from "../client";
import User from "../../models/user";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/mailer";

// Your new function:
const helloWorld = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signUp" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;

      //step 1 getting user email
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email: email });
        if (!userObject) {
          throw new NonRetriableError("User not found");
        }
        return userObject;
      });

      //step 2 sending welcome email
      await step.run("send-welcome-email", async () => {
        const subject = "Welcome to the Inngest TMS";
        const text = `Welcome to the Inngest TMS ${user.name}`;
        const html = `<h1>Welcome to the Inngest TMS ${user.name}</h1>`;
        await sendEmail(user.email, subject, text, html);
      });
      return { success: true };
    } catch (error) {
      console.log("error in the on-user-signup function", error);
      return { success: false };
    }
  }
);

// Add the function to the exported array:
export const functions = [helloWorld];
