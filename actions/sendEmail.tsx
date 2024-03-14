"use server";

import React from "react";
import { Resend } from "resend";
import { validateString, getErrorMessage } from "@/lib/utils";
import ContactFormEmail from "@/emails/ContantEmail";
import type { formData } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (formData: formData) => {
  if (!validateString(formData.senderEmail, 500)) {
    return {
      error: "Invalid sender email",
    };
  }
  if (!validateString(formData.message, 5000)) {
    return {
      error: "Invalid message",
    };
  }

  let data;
  try {
    data = await resend.emails.send({
      from: "New portfolio message <onboarding@resend.dev>",
      to: "stepan.krousky@seznam.cz",
      subject: "Message from portfolio",
      reply_to: formData.senderEmail,
      react: React.createElement(ContactFormEmail, {
        message: formData.message,
        senderEmail: formData.senderEmail,
      }),
    });
  } catch (error: unknown) {
    return {
      error: getErrorMessage(error),
    };
  }

  return {
    data,
  };
};