#!/usr/bin/env node
const { program } = require("commander");
const { execSync } = require("child_process");
const {
  checkCurrentStatus,
  setCurrentStatus,
  setDND,
  clearCurrentStatus,
  clearDND,
  formatStatusExpiration,
} = require("./processes");
const fs = require("fs");

program
  .option("-c, --current", "Check current status")
  .option("-hd, --headsdown", "Preconfigured 'Heads down' status")
  .option("-m, --minutes", "Minutes to be not disturbed")
  .option("-x, --clear", "Clear status")
  .option(
    "-dnd, --snooze",
    "Do not disturb (Snooze notifications). Enter amount of minutes to snooze, or will default to 30min. Example: 'status -dnd 45'"
  )
  .option("-w, --wake", "End snooze (Do not disturb)")
  .option(
    "-s, --set <status>",
    'Set a custom status with text and emoji combined. Example: --set "working from home :house:"'
  )
  .option(
    "-p, --preset",
    "Select a preset status from the list using fzf"
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
} else if (opts.preset) {
  // Load presets from the file
  const presetsFile = 'presets.txt'; // Path to the presets file
  if (!fs.existsSync(presetsFile)) {
    console.error(`Presets file not found at ${presetsFile}`);
    process.exit(1);
  }

  // Read the presets from the file and use fzf to select one
  const presets = fs.readFileSync(presetsFile, 'utf8').split('\n').filter(line => line.trim());
  const selectedPreset = execSync(`echo "${presets.join('\n')}" | fzf`, { encoding: 'utf8' }).trim();

  if (!selectedPreset) {
    console.error("No preset selected.");
    process.exit(1);
  }

  // The selected preset is now passed in the correct format for the --set option
  // We need to ensure the format is "Text with Emoji" for --set
  const presetParts = selectedPreset.match(/(.+)\s+(:.+:)/);
  if (!presetParts) {
    console.error("Selected preset is in an invalid format.");
    process.exit(1);
  }

  const [, presetText, presetEmoji] = presetParts;

  // Set the selected preset as the current status
  setCurrentStatus({
    status_text: presetText.trim(),
    status_emoji: presetEmoji.trim(),
    status_expiration: 0,
  });
}