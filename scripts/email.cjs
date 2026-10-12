/* eslint-disable @typescript-eslint/no-require-imports -- Native Node CLI. */
// Run with Node's --env-file=.env.local when using a configured provider.
const fs = require('node:fs');
async function main() {
  const mail = await import('../lib/email/service.mjs');
  const [command, arg] = process.argv.slice(2);
  if (command === 'list') console.table(mail.outbox());
  else if (command === 'preview') {
    const message = mail.preview(arg);
    if (!message) throw new Error('Preview not found');
    const output = require('node:path').join(process.cwd(), '.data', 'email-preview.html');
    fs.writeFileSync(output, message.html);
    console.log(`Preview saved to ${output}`);
  } else if (command === 'drain') console.log(`Processed ${await mail.drain()} queued messages.`);
  else if (command === 'campaign') {
    const input = JSON.parse(fs.readFileSync(arg, 'utf8'));
    console.log(`Queued for ${mail.campaign(input)} confirmed subscribers. Run drain to process delivery.`);
  } else throw new Error('Usage: node scripts/email.cjs list | preview <id> | drain | campaign <json-file>');
}
main().catch(error => { console.error(error.message); process.exitCode=1; });
