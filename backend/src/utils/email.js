const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Send a generic email.
 * @param {object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
    text,
  });
};

const sendVerificationEmail = async (user, token) => {
  const url = `${config.client.url}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your AI Study Assistant email',
    html: `
      <h2>Hello ${user.name},</h2>
      <p>Please click the button below to verify your email address.</p>
      <a href="${url}" style="
        display:inline-block;padding:12px 24px;background:#4F46E5;
        color:#fff;text-decoration:none;border-radius:6px;">
        Verify Email
      </a>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
    `,
    text: `Verify your email: ${url}`,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${config.client.url}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your AI Study Assistant password',
    html: `
      <h2>Hello ${user.name},</h2>
      <p>You requested a password reset. Click the button below to set a new password.</p>
      <a href="${url}" style="
        display:inline-block;padding:12px 24px;background:#DC2626;
        color:#fff;text-decoration:none;border-radius:6px;">
        Reset Password
      </a>
      <p>This link expires in <strong>10 minutes</strong>.</p>
      <p>If you did not request a reset, please ignore this email.</p>
    `,
    text: `Reset your password: ${url}`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
