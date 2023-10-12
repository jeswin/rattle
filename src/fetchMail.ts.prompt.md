Create a nodejs service in (fetchMail.ts) that:

- Checks a POP3 mail service and downloads emails
- Get the server, email id and password from these env variables
  1. RATTLE_EMAIL_ID
  2. RATTLE_MAILSERVER
  3. RATTLE_EMAIL_PASSWORD
- It should download all emails including attachments, and call the function saveEmail(sub, body, attachments[])
  - As of now, only one attachment should be considered.
  - If the attachment is greater than RATTLE_MAX_ATTACHMENT_MB in size, don't call saveEmail.
    - call sendReply(sub, body) with:
      - sub = Rattle: The attachment was too big. Discarded.
      - body = You attachment should be at most ${RATTLE_MAX_ATTACHMENT_MB} MB in size. Right now we handle on jpegs. /n/n Cheers.
  - If RATTLE_MAX_ATTACHMENT_MB is missing, use 10 as its value
  - Once the attachment is downloaded and saveEmail is called successfully, delete the email from the server
- If any of the environment variables are missing, print an error saying that the specific env variable is missing.

## Conventions

- Use modern JS, async await
- Use ES6 Module style import export
- Prefer functional style code where applicable
- Use Typescript
- Include commenting as needed
