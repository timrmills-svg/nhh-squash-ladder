// functions/index.js - Main function file (clean and focused)
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const sgMail = require("@sendgrid/mail");
const emailTemplates = require("./emailTemplates");

initializeApp();

exports.sendEmail = onDocumentCreated(
    "notifications/{docId}",
    async (event) => {
      const data = event.data.data();

      if (data.emailSent) return;

      // Use the hardcoded API key
      const sendgridKey = "SG.YXOYO406Q5-C47_jDiU1vw." +
      "0V3mPCpVKnYCF3-7l4mxqnOaClKBlfPvaNqw9EdRJbk";
      sgMail.setApiKey(sendgridKey);

      try {
      // Get email content from separate templates module
        const emailContent = emailTemplates.getEmailContent(data);

        await sgMail.send({
          to: data.to,
          from: "tim.r.mills+nhhsquash@gmail.com",
          subject: emailContent.subject,
          html: emailContent.html,
        });

        await event.data.ref.update({
          emailSent: true,
          status: "sent",
          sentAt: new Date(),
        });

        console.log("Email sent successfully to:", data.to);
      } catch (error) {
        console.error("Email failed:", error);
        await event.data.ref.update({
          emailSent: false,
          status: "failed",
          error: error.message,
        });
      }
    },
);
