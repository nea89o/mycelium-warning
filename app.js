const HYPIXEL_API_KEY = process.env.HYPIXEL_API_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL); // 10 minutes
const WARN_AFTER = 60 * 60 * 9; // 9 hours

const profiles = [];

for (let i = 0; true; i++) {
  if (!process.env["PROFILE" + i]) break;
  profiles.push({
    profile: process.env["PROFILE" + i],
    playerId: process.env["PLAYER" + i],
    ping: process.env["DISCORD" + i],
  });
}

function getProfile(p) {
  return fetch(
    `https://api.hypixel.net/v2/skyblock/profiles?key=${HYPIXEL_API_KEY}&uuid=${p.playerId}`,
  )
    .then((it) => it.json())
    .then((it) =>
      it.profiles.find((profile) => profile.cute_name === p.profile),
    );
}
function warn(userid) {
  return fetch(DISCORD_WEBHOOK_URL + "?wait=true", {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      content: `<@${userid}> RATE MAL WER GERADE KEINE MYCELIUM COLLECTION BEKOMMT? DU!`,
      allowed_mentions: {
        users: [userid],
      },
    }),
    method: "POST",
  });
}

const lastCollectionGain = [];
const lastCollection = [];
for (i in profiles) {
  lastCollectionGain[i] = Date.now();
  lastCollection[i] = 0;
}

async function checkCollections() {
  for (i in profiles) {
    const p = profiles[i];
    try {
      const data = await getProfile(p);
      console.log(data);
      let collectionTotal = 0;
      for (memberid in data.members) {
        const member = data.members[memberid];
        const collectionOne = member.collection?.MYCEL;
        if (collectionOne) collectionTotal += collectionOne;
      }
      const last = lastCollection[i];
      if (last !== collectionTotal) {
        lastCollection[i] = collectionTotal;
        lastCollectionGain[i] = Date.now();
      }
      console.log("last: " + last);
      console.log("current: " + collectionTotal);
      if (Date.now() - lastCollectionGain[i] > WARN_AFTER * 1000) {
        warn(p.ping)
          .then((it) => it.json())
          .then(console.log, console.error);
      }
    } catch (e) {
      console.error("COULD NOTN CHECK PROFILES", e)
    }
  }
}
setInterval(checkCollections, CHECK_INTERVAL * 1000);
checkCollections();
