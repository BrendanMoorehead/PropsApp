
 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const axios = require('axios');
const { 
    isFuture, 
    checkGameState, 
    delay, 
    getTimestampByGameID, 
    convertDateFormat,
    getNextThursday,
    getNextSunday,
    getNextMonday,
    getHandicap,
    getPlayerName,
    formatMarketKey,
    retrieveSingleMarket,
    removeDuplicateOutcomes,
    removeZeroHandicaps,
    findPlayerByName, 
    checkPropHit
 } = require ("./helperFunctions");

 admin.initializeApp();
 
 exports.getNFLGames = functions.pubsub.schedule('0 5 * * 2') // Every Tuesday at 5:00 AM
  .timeZone('America/New_York')
  .onRun(async () => {
     try {
         const apiKey = functions.config().prop_odds.api_key;
         const monapiUrl = `https://api.prop-odds.com/beta/games/nfl?date=${getNextMonday()}&tz=America/New_York&api_key=${apiKey}`;
         const thursapiUrl = `https://api.prop-odds.com/beta/games/nfl?date=${getNextThursday()}&tz=America/New_York&api_key=${apiKey}`;
         const sunapiUrl = `https://api.prop-odds.com/beta/games/nfl?date=${getNextSunday()}&tz=America/New_York&api_key=${apiKey}`;
 
         const monGames = (await axios.get(monapiUrl)).data;
         const thursGames = (await axios.get(thursapiUrl)).data;
         const sunGames = (await axios.get(sunapiUrl)).data;
 
         await admin.firestore().collection('futureNflGameDays').doc(getNextMonday()).set(monGames);
         await admin.firestore().collection('futureNflGameDays').doc(getNextThursday()).set(thursGames);
         await admin.firestore().collection('futureNflGameDays').doc(getNextSunday()).set(sunGames);
 
         console.log("Games added successfully.");
         return null; // Function executed successfully
     } catch (error) {
         console.error('Error fetching NFL games:', error);
         return null; // Return null even if there is an error to signify function completion
     }
 });

//CHANGE TO TAKE ANY STRING
exports.getPlayerReceptions = functions.pubsub.schedule('0 5 * * *')
 .timeZone('America/New_York')
.onRun(async (context) => {
    try{
        const today = new Date();
        today.setHours(0,0,0,0);
        const gameDays = await admin.firestore().collection('futureNflGameDays').get();
        const apiKey = functions.config().prop_odds.api_key;

        for (const dayDoc of gameDays.docs){
            const dayDate = new Date(dayDoc.id);
            
            if (dayDate < today) continue;
            const dayData = dayDoc.data();
            const games = dayData.games || [];

            for (const game of games){
                const gameId = game.game_id;
                const url = `https://api.prop-odds.com/beta/odds/${gameId}/player_receptions_over_under?api_key=${apiKey}`;
                const response = await axios.get(url);
                const playerPropsData = response.data;

                await admin.firestore().collection('playerProps').doc(gameId.toString()).set(playerPropsData);

            }
            console.log("Player reception props retrieved and stored.");
        }
        return null;
    } catch (error){
        console.error("Error fetching player props: ", error);
        return null;
    }
});

exports.createPlayerPropsProfile = functions.pubsub.schedule('2 5 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const gameDays = await admin.firestore().collection('playerProps').get();

      const promises = [];
      for (const dayDoc of gameDays.docs) {
        try {
          const gameId = dayDoc.id;
          const gameStartTime = await getTimestampByGameID(gameId);
          const matchedGameSnapshot = await admin.firestore().collection('NFLGames')
                .where('game_id', '==', gameId)
                .limit(1)
                .get();
                console.log(matchedGameSnapshot.docs[0]);
            if (!matchedGameSnapshot.empty) {
                // If a match is found, create a new document in the NFLGames collection
                const matchedGame = matchedGameSnapshot.docs[0];
                console.log("TEST" + JSON.stringify(matchedGame.data().apiGameId));
                try {
                    const market = await retrieveSingleMarket(gameId, 'fanduel');
                    for (const outcome of market.outcomes) {
                        const playerName = getPlayerName(outcome);
                        const handicap = getHandicap(outcome);
                        const playerDoc = await findPlayerByName(playerName);
            
                        if (!playerDoc) {
                            console.error(`Player not found: ${playerName}`);
                            // Handle the case when player is not found
                            continue;
                        }
            
                        const profile = {
                          playerName: playerName,
                          marketKey: market.market_key,
                          handicap: handicap,
                          gameId: gameId,
                          startTime: gameStartTime,
                          playerId: playerDoc.data.player.id,
                          nflApiGameId: JSON.stringify(matchedGame.data().apiGameId),
                          outcome: 'active',
                        }
                
                        const docId = `${gameId}_${playerName}_${market.market_key}`;
                        promises.push(admin.firestore().collection('futurePlayerPropProfiles').doc(docId).set(profile));
                    }
                } catch (error) {
                    console.error("Error retrieving market for game ID " + gameId + ": ", error);
                    // Continue to the next dayDoc if retrieveSingleMarket fails
                    continue;
                }
            }

          
        } catch (error) {
          console.error("Couldn't create profiles for game: " + dayDoc.id, error);
          return;
        }
      }
      await Promise.all(promises);
    } catch (error) {
      console.error("Profile creation failed.", error);
    }
  });


  exports.getNFLGameIds = functions.pubsub.schedule('5 5 * * 2') // Every Tuesday at 5:05 AM
  .timeZone('America/New_York')
  .onRun(async () => {
    const promises = [];
    const uniqueGameIds = {};
    //Get the upcoming game days
    try{
        const gameDays = [getNextThursday(), getNextSunday(), getNextMonday()];
        for (const day of gameDays) {
        const apiDate = convertDateFormat(day);
        const options = {
            method: 'GET',
            url: `https://americanfootballapi.p.rapidapi.com/api/american-football/matches/${apiDate}`,
            headers: {
            'X-RapidAPI-Key': functions.config().nfl_api.api_key,
            'X-RapidAPI-Host': 'americanfootballapi.p.rapidapi.com'
            }};
            const response = await axios.get(`https://americanfootballapi.p.rapidapi.com/api/american-football/matches/${apiDate}`, 
            { headers: options.headers });
            const nflGames = response.data.events.filter(game => game.tournament && game.tournament.name === "NFL");
            for (const game of nflGames){
                uniqueGameIds[game.id] = true;
                const gameRef = admin.firestore().collection('NFLapiGames').doc(game.id.toString());
                promises.push(gameRef.set(game));
            }
        }
        await Promise.all(promises);
    } catch (error) {
        throw new Error("Failed to get NFLAPI games: "  + error.message);
    }
  });


  exports.disablePastProps = functions.pubsub.schedule('every 20 minutes').onRun(async (context) => {
      const now = new Date();
      const propsCollection = admin.firestore().collection('futurePlayerPropProfiles');

    

      if (querySnapshot.empty){
          console.log("No props found.");
          return null;
      }

      const batch = admin.firestore().batch();
      querySnapshot.forEach(doc =>{
          const prop = doc.data();
          const startTime = new Date(prop.startTime);
          
          if (startTime <= now){
              const docRef = propsCollection.doc(doc.id);
              batch.update(docRef, {enabled: false});
              console.log(`Disabling prop ${doc.id}.`);
          }
      });
      await batch.commit()
      console.log("Checked props and updated as needed.");
      return null;
  })

  exports.removePastGames = functions.pubsub.schedule('59 23 * * 0,1,4')
  .onRun(async(context)=> {
    const data = await checkGameState('d1Gh90d1Oc3XxFiXRQhM');
    console.log(data);
  });

exports.createCompositeNFLGames = functions.pubsub.schedule('6 5 * * 2')
.onRun(async(context)=> {
    const futureNFLGamesSnapshot = await admin.firestore().collection('futureNflGameDays').get();
    const batchOperations = [];

    for (const doc of futureNFLGamesSnapshot.docs){
        //Each FutureNFLGames day
        const games = doc.data().games;
        //Each game listed in each day
        for (const game of games){
            const matchedGameSnapshot = await admin.firestore().collection('NFLapiGames')
                .where('homeTeam.name', '==', game.home_team)
                .where('awayTeam.name', '==', game.away_team)
                .limit(1)
                .get();
                if (!matchedGameSnapshot.empty) {
                    // If a match is found, create a new document in the NFLGames collection
                    const matchedGame = matchedGameSnapshot.docs[0];
                    const newNFLGameRef = admin.firestore().collection('NFLGames').doc();
    
                    batchOperations.push(
                        newNFLGameRef.set({
                            ...game, // Spread the existing game data
                            apiGameId: matchedGame.id // Add the reference ID from the matched game
                        })
                    );
                }
        }
    }
     // Execute all batch operations
     try {
        await Promise.all(batchOperations);

    } catch (error) {
        console.error('Error creating NFLGames collection: ', error);
    }
});

exports.getAllTeams = functions.pubsub.schedule('5 5 1 * *') //Runs once a month
.onRun(async(context)=> {
    const promises = [];
    const teamIDs = [4412, 4413, 4414, 4415, 4416, 4417, 4418, 4419, 4420, 4421, 4422, 4423, 4424, 
        4425, 4426, 4427, 4428, 4429, 4430, 4431, 4432, 4386, 4324, 4287, 4390, 4388, 4389, 4387, 4392,
        4345, 4391, 4393];
    try{
        for (const team of teamIDs){
            const options = {
                method: 'GET',
                url: `https://americanfootballapi.p.rapidapi.com/api/american-football/team/${team}`,
                headers: {
                'X-RapidAPI-Key': functions.config().nfl_api.api_key,
                'X-RapidAPI-Host': 'americanfootballapi.p.rapidapi.com'
            }};
            const response = await axios.get(`https://americanfootballapi.p.rapidapi.com/api/american-football/team/${team}`, 
            { headers: options.headers });
            const nflTeam = response.data;
            const teamRef = admin.firestore().collection('nflTeams').doc(team.toString());
            promises.push(teamRef.set(nflTeam));
            await delay(200);
        }
    }catch (error){
        console.error("Failed to get NFL teams");
    }
});


exports.getAllPlayers = functions.pubsub.schedule('10 5 1 * *') //Executes once a month.
.onRun(async(context)=> {
    const promises = [];
    const teamIDs = [4412, 4413, 4414, 4415, 4416, 4417, 4418, 4419, 4420, 4421, 4422, 4423, 4424, 
        4425, 4426, 4427, 4428, 4429, 4430, 4431, 4432, 4386, 4324, 4287, 4390, 4388, 4389, 4387, 4392,
        4345, 4391, 4393];
        try{
            for (const team of teamIDs){
                const options = {
                    method: 'GET',
                    url: `https://americanfootballapi.p.rapidapi.com/api/american-football/team/${team}/players`,
                    headers: {
                    'X-RapidAPI-Key': functions.config().nfl_api.api_key,
                    'X-RapidAPI-Host': 'americanfootballapi.p.rapidapi.com'
                }};
                const response = await axios.get(`https://americanfootballapi.p.rapidapi.com/api/american-football/team/${team}/players`, 
                { headers: options.headers });
                const nflTeamPlayers = response.data.players;
                for (const player of nflTeamPlayers) {
                    const playerRef = admin.firestore().collection('nflPlayers').doc();
                    promises.push(playerRef.set(player));
                }
                await delay(200);
            }
        }catch (error){
            console.error("Failed to get NFL players");
        }
});





