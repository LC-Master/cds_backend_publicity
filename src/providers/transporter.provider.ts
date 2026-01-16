import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025, 
  secure: false, 
  auth: {
    user: "test",
    pass: "test",
  },
  tls: {
    rejectUnauthorized: false, 
  },
});
