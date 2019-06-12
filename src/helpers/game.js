const queue = require('./queue.js');
const config = require('../../app/config');
const fs = require('fs');

const cache = require('node-file-cache').create({
  file: `${process.cwd()}/app/data/matches.json`,
  life: 240
});
module.exports = {
    sendAwaitConfirmation: (client) => {
        queue.get()
        .then(players => {
            players.map((player, index) => {
                queue.setConfirmable(player.id, true);
                client.users.find(x => x.id == player.id).send({
                    embed: {
                      author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                      },
                      color: Number(config.colour),
                      description: `Please confirm the match inside by typing ${config.prefix}ready inside the confirm-match text channel.`
                    }
                  })
            });
        });
    },
    initialize: (players) => {
      //GET THE ELO. AND SETUP TEAMS.
      let team1 = [];
      let team2 = [];
      
      let json = {
        "matchid": Math.floor(Math.random(0, 1)* 100),
        hasStarted: false,
        allPlayersConfirmed: false,
        team1: team1,
        team2: team2
      }
      
      for(let i = 0; i < players.length; i += 2){
        team1.push(players[i]);
      }
      for(let i = 1; i < players.length; i += 2){
        team2.push(players[i]);
      }

      //I NEED TO ADD SUPPORT FOR MULTIPLE GAMES LATER DOW THE ROAD YES I KNOW.
      const matchData = json
  
      cache.set('match', matchData);
    },

    changePlayerReadyStatus: (playerid, ready, client) => {
      const matchData = cache.get('match') || [];
      
      let hasAllPlayerConfirmed = true;
      matchData.team1.map((item, index) => {
        if(item.id === playerid){
          item.confirmed = ready;
        }
        if(item.confirmed === false) hasAllPlayerConfirmed = false; 
      });
      matchData.team2.map((item, index) => {
        if(item.id === playerid){
          item.confirmed = ready;
        }
        if(item.confirmed === false) hasAllPlayerConfirmed = false; 
      });
      matchData.allPlayersConfirmed = hasAllPlayerConfirmed;
      cache.set('match', matchData);
      if(matchData.allPlayersConfirmed){
        console.log("All players has confirmed.");
        console.log(`Team 1: ${matchData.team1}`);
        console.log(`Team 2: ${matchData.team2}`);
        
        fs.readFile(`${process.cwd()}/app/data/textchannels.json`, 'utf-8', (err, data) => {
          if(err) throw err;
          client.channels.get(JSON.parse(data).queueChannelID.toString()).send(`All players has accepted, you will be moved to your team and you are welcome to join this ip: THIS_DOES_NOT_WORK_YET_XD`)
        })
        
      }
    }
}