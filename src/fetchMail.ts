import { promisify } from 'util';
import { simpleParser } from 'mailparser';
import { connect } from 'node-poplib';
import { saveEmail, sendReply } from './emailFunctions';

// Function to fetch and process emails
async function fetchEmails() {
  try {
    // Get environment variables
    const emailId = process.env.RATTLE_EMAIL_ID;
    const mailServer = process.env.RATTLE_MAILSERVER;
    const emailPassword = process.env.RATTLE_EMAIL_PASSWORD;

    // Check if any of the environment variables are missing
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

    // Connect to POP3 mail server
    const client = connect({
      hostname: mailServer,
      port: 995,
      tls: true,
      username: emailId,
      password: emailPassword
    });

    // Promisify client methods
    const connectAsync = promisify(client.connect.bind(client));
    const listAsync = promisify(client.list.bind(client));
    const retrieveAsync = promisify(client.retrieve.bind(client));
    const deleteAsync = promisify(client.delete.bind(client));
    const quitAsync = promisify(client.quit.bind(client));

    // Connect to mail server
    await connectAsync();

    // Get list of emails
    const emailList = await listAsync();

    // Iterate through each email
    for (const email of emailList) {
      // Retrieve email content
      const emailContent = await retrieveAsync(email.msgId);

      // Parse email using mailparser
      const parsedEmail = await simpleParser(emailContent);

      // Check if email has attachments
      if (parsedEmail.attachments.length > 0) {
        const attachment = parsedEmail.attachments[0];

        // Check if attachment size is greater than RATTLE_MAX_ATTACHMENT_MB
        const maxAttachmentSize = process.env.RATTLE_MAX_ATTACHMENT_MB || 10;
        if (attachment.size > maxAttachmentSize * 1024 * 1024) {
          // Send reply if attachment size is too big
          await sendReply(parsedEmail.subject, 'Sorry. The attachment was too big. Discarded.');
        } else {
          // Save email and delete from server
          await saveEmail(parsedEmail.subject, parsedEmail.text, [attachment]);
          await deleteAsync(email.msgId);
        }
      } else {
        // Save email and delete from server
        await saveEmail(parsedEmail.subject, parsedEmail.text, []);
        await deleteAsync(email.msgId);
      }
    }

    // Quit connection to mail server
    await quitAsync();
  } catch (error) {
    console.error('Error occurred while fetching emails:', error);
  }
}

// Call fetchEmails function
fetchEmails();