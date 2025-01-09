#!/usr/bin/env node
const { program } = require("commander");
const {
  checkCurrentStatus,
  setCurrentStatus,
  setDND,
  clearCurrentStatus,
  clearDND,
  formatStatusExpiration,
} = require("./processes");

program
  .option("-c, --current", "Check current status")
  .option("-hd, --headsdown", "Preconfigured 'Heads down' status")
  .option("-m, --minutes", "Minutes to be not disturbed")
  .option("-x, --clear", "Clear status")
  .option(
    "-dnd, --snooze",
    `Do not disturb (Snooze notifications)
    Enter amount of minutes to snooze, or will default to 30min
    ex: "status -dnd 45"
    `
  )
  .option("-w, --wake", "End snooze (Do not disturb)")
  .option(
    "-s, --set <status>",
    'Set a custom status with text and emoji combined. Example: --set "working from home :house:"'
  )
  .parse(process.argv);

const opts = program.opts();

if (opts.current) {
  checkCurrentStatus();
} else if (opts.headsdown) {
  setCurrentStatus({
    status_text: "heads down",
    status_emoji: ":heads-down:",
    status_expiration: 0,
  });
  setDND(30);
} else if (opts.clear) {
  clearCurrentStatus();
} else if (opts.snooze) {
  const minutes = parseInt(opts.snooze, 10) || 30;
  setDND(minutes);
} else if (opts.wake) {
  clearDND();
} else if (opts.set) {
  // Extract the text and emoji from the combined argument
  const statusParts = opts.set.match(/(.+)\s+(:.+:)/);
  if (!statusParts) {
    console.error(
      'Error: Invalid format. Use --set "status text :emoji:". Example: --set "working from home :house:"'
    );
    process.exit(1);
  }

  const [, statusText, statusEmoji] = statusParts;

  setCurrentStatus({
    status_text: statusText.trim(),
    status_emoji: statusEmoji.trim(),
    status_expiration: 0, // Default to non-expiring status
  });
}
