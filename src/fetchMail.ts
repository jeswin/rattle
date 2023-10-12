import { simpleParser } from 'mailparser';
import { connect } from 'node-poplib-yahoo';
import { saveEmail, sendReply } from './emailUtils';

const fetchMail = async () => {
  try {
    const emailId = process.env.RATTLE_EMAIL_ID;
    const mailServer = process.env.RATTLE_MAILSERVER;
    const emailPassword = process.env.RATTLE_EMAIL_PASSWORD;
    const maxAttachmentSize = process.env.RATTLE_MAX_ATTACHMENT_MB || 10;

    if (!emailId) {
      console.error('RATTLE_EMAIL_ID environment variable is missing');
      return;
    }
    if (!mailServer) {
      console.error('RATTLE_MAILSERVER environment variable is missing');
      return;
    }
    if (!emailPassword) {
      console.error('RATTLE_EMAIL_PASSWORD environment variable is missing');
      return;
    }

    const client = connect({
      hostname: mailServer,
      port: 995,
      tls: true,
      username: emailId,
      password: emailPassword,
    });

    await client.connect();

    const count = await client.listCount();
    for (let i = 1; i <= count; i++) {
      const email = await client.retr(i);
      const parsedEmail = await simpleParser(email);

      const attachments = parsedEmail.attachments || [];
      const attachment = attachments[0];

      if (attachment && attachment.size > maxAttachmentSize * 1024 * 1024) {
        await sendReply('Rattle: The attachment was too big. Discarded.', `Your attachment should be at most ${maxAttachmentSize} MB in size. Right now we handle only jpegs.\n\nCheers.`);
        continue;
      }

      await saveEmail(parsedEmail.subject, parsedEmail.text, attachments);

      await client.dele(i);
    }

    await client.quit();
  } catch (error) {
    console.error('An error occurred while fetching and processing emails:', error);
  }
};

fetchMail();