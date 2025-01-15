const { WebClient } = require("@slack/web-api");
require("dotenv").config();

const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

module.exports = Object.freeze({
  checkCurrentStatus: async () => {
    const res = await web.users.profile.get({
      token,
    });
    const dnd = await web.dnd.info();
    console.log("Current Status: ", res.profile.status_text || "[None]");
    console.log("Do not disturb:", dnd.dnd_enabled ? "enabled" : "disabled");
    const timeRemaining =
      (res.profile.status_expiration - Date.now() / 1000) / 60;
    console.log(
      res.profile.status_expiration
        ? `${Math.round(timeRemaining)} minutes remaining`
        : ""
    );
  },
  setCurrentStatus: async (status) => {
    try {
      const res = await web.users.profile.set({
        token,
        profile: status,
      });

      if (!res.ok) {
        if (res.error === "profile_status_set_failed_not_valid_emoji") {
          console.error("Invalid emoji. Please use a valid emoji format like ':house:'");
        } else {
          console.error("Failed to set status:", res.error);
        }
      } else {
        console.log("Status updated!");
      }
    } catch (error) {
      console.error("Error setting status:", error.message);
    }
  },
  setDND: async (minutes) => {
    const res = await web.dnd.setSnooze({
      token,
      num_minutes: minutes,
    });
  },
  clearCurrentStatus: async () => {
    const res = await web.users.profile.set({
      token,
      profile: { status_text: "", status_emoji: "" },
    });

    console.log(res.ok ? "Status cleared!" : "");
  },
  clearDND: async () => {
    const res = await web.dnd.endDnd({ token });
  },
  formatStatusExpiration: (minutes, currentTimeUnix = Date.now() / 1000) => {
    return (currentTimeUnix += minutes * 60);
  },
});
