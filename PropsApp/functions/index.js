
 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const axios = require('axios');
const { 
    isFuture, 
    delay, 
    convertDateFormat,
    getNextThursday,
    getNextSunday,
    getNextMonday,
    getHandicap,
    getPlayerName,
    retrieveSingleMarket,
    findPlayerByName, 
    checkPropHit,
    checkUserProp,
    getLineName,
    determinePlayerPicks,
    bulkUpdateRecord
 } = require ("./helperFunctions");
 admin.initializeApp();
 
 /**
  * Gets the weekly NFL games from the Odds API and stores them in the database.
  * 
  * @runs every Tuesday at 5:00AM
  * @expected_load 3 writes / week
  */
 exports.getOddsAPINFLGames = functions.pubsub.schedule('0 5 * * 2')
  .timeZone('America/New_York')
  .onRun(async () => {
     try {
         const apiKey = functions.config().prop_odds.api_key;
         const gameDays = [getNextThursday(), getNextSunday(), getNextMonday()];  
         for (const day of gameDays){
            const apiUrl = `https://api.prop-odds.com/beta/games/nfl?date=${day}&tz=America/New_York&api_key=${apiKey}`;
            const dayGames = (await axios.get(apiUrl)).data;
            await admin.firestore().collection('weeklyOddsAPIGames').doc(day).set(dayGames);
         }
         console.log("Games added successfully.");
         return null; // Function executed successfully
     } catch (error) {
         console.error('Error fetching NFL games:', error);
         return null; // Return null even if there is an error to signify function completion
     }
 });

/**
 * Gets the available player reception lines for the next week and stores them in the database.
 * 
 * @runs every day at 5:00AM
 */
exports.getPlayerReceptions = functions.pubsub.schedule('0 5 * * *')
.timeZone('America/New_York')
.onRun(async () => {
    let batch = admin.firestore().batch();
    const batchLimit = 500;
    let operationCount = 0;

    try{
        const today = new Date();
        today.setHours(0,0,0,0);
        const gameDays = await admin.firestore().collection('weeklyOddsAPIGames').get();
        const apiKey = functions.config().prop_odds.api_key;

        for (const dayDoc of gameDays.docs){
            const dayDate = new Date(dayDoc.id);
            
            if (dayDate < today) continue;
            const dayData = dayDoc.data();
            const games = dayData.games || [];

            for (const game of games){
                const gameId = game.game_id;
                const url = `https://api.prop-odds.com/beta/odds/${gameId}/player_receptions_over_under?api_key=${apiKey}`;
                try{
                    const response = await axios.get(url);
                    const playerPropsData = response.data;
                    const docRef = admin.firestore().collection('oddsData').doc(gameId.toString());
                    if (playerPropsData && Object.keys(playerPropsData).length > 0) {
                        batch.set(docRef, playerPropsData);
                        operationCount++;
                    } else {
                        console.log(`No matching odds found for game ID: ${gameId}`);
                    }
                } catch (apiError) {
                    console.error(`Error fetching data for game ID: ${gameId}`, apiError);
                }
                
                if (operationCount === batchLimit){
                    await batch.commit();
                    batch = admin.firestore().batch();
                    operationCount = 0;
                }
                
               
            }
            console.log("Player reception props retrieved and stored.");
        }
        if (operationCount > 0){
            await batch.commit();
        }
        return null;
    } catch (error){
        console.error("Error fetching player props: ", error);
        return null;
    }
});

/**
 * Parses the player props stored in the database into individual player profiles.
 * 
 * @runs every day at 5:05AM
 */
exports.createPlayerPropsProfile = functions.pubsub.schedule('5 5 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    try {
      const gameDays = await admin.firestore().collection('oddsData').get();
      let batch = admin.firestore().batch();
      const batchLimit = 500;
      let operationCount = 0;

      for (const dayDoc of gameDays.docs) {
        try {
          const gameId = dayDoc.id;
          const matchedGameSnapshot = await admin.firestore().collection('NFLGames')
                .where('game_id', '==', gameId)
                .limit(1)
                .get();
                console.log(matchedGameSnapshot.docs[0]);
            if (!matchedGameSnapshot.empty) {
                // If a match is found, create a new document in the NFLGames collection
                const matchedGame = matchedGameSnapshot.docs[0];
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
                          startTime: matchedGame.data().start_timestamp,
                          playerId: playerDoc.data.player.id,
                          nflApiGameId: parseInt(matchedGame.data().apiGameId),
                          outcome: 'active',
                          line: getLineName(outcome.description)
                        }

                        const docName = `${playerName}_${market.market_key}_${matchedGame.data().start_timestamp}`
                        docRef = admin.firestore().collection('futurePlayerPropProfiles').doc(docName);
                        batch.set(docRef, profile);
                        operationCount++;

                        if (operationCount === batchLimit){
                            await batch.commit();
                            batch = admin.firestore().batch;
                            operationCount = 0;
                        }
                    }
                } catch (error) {
                    console.error("Error retrieving market for game ID " + gameId + ": ", error);
                    // Continue to the next dayDoc if retrieveSingleMarket fails
                    continue;
                }
            }   
        } catch (error) {
          throw new Error("Couldn't create profiles for game: " + dayDoc.id, error);
        }
      }
      if (operationCount > 0){
          await batch.commit();
      }
    } catch (error) {
      throw new Error ("potential batch error " + error);
    }
  });

/**
 * Gets the upcoming game data for the weekly games from the NFL API.
 * 
 * @runs every Tuesday at 5:05AM
 * NOTE: Tested with batching.
 */
  exports.getNFLGameIds = functions.pubsub.schedule('5 5 * * 2')
  .timeZone('America/New_York')
  .onRun(async () => {
    const promises = [];
    let batch = admin.firestore().batch();
    const batchLimit = 500;
    let operationCount = 0;
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
                const gameRef = admin.firestore().collection('weeklyNFLAPIGames').doc(game.id.toString());
                batch.set(gameRef, game);
                operationCount++;
                if (operationCount === batchLimit){
                    await batch.commit();
                    batch = admin.firestore().batch();
                    operationCount = 0;
                }
            }
        }
        if (operationCount > 0){
            await batch.commit();
        }
    } catch (error) {
        throw new Error("Failed to get NFLAPI games: "  + error.message);
    }
  });


  exports.disablePastProps = functions.pubsub.schedule('every 20 minutes').onRun(async () => {
    try {
      const now = new Date();
      const propsCollection = admin.firestore().collection('futurePlayerPropProfiles');
      const pastPropsCollection = admin.firestore().collection('pastPlayerPropProfiles');
    
      // Query for future props
      const querySnapshot = await propsCollection.get();
  
      if (querySnapshot.empty) {
        console.log("No future props found.");
        return null;
      }
  
      let batch = admin.firestore().batch();
      const batchLimit = 500;
      let operationCount = 0;
      querySnapshot.forEach(async (doc) => {
        const prop = doc.data();
        const startTime = new Date(prop.startTime);
  
        if (!isFuture(startTime)) {
          const futurePropDocRef = propsCollection.doc(doc.id);
          const pastPropDocRef = pastPropsCollection.doc(doc.id);

          batch.update(futurePropDocRef, { enabled: false });
          batch.set(pastPropDocRef, prop);
          batch.delete(futurePropDocRef);
          operationCount += 3;

          if (operationCount >= (batchLimit - 3)){
              await batch.commit();
              batch = admin().firestore().batch();
              operationCount = 0;
          }

          console.log(`Disabling prop ${doc.id}.`);
        }
      });
      if (operationCount > 0){
        await batch.commit();
      }
      console.log("Checked props and updated as needed.");
      return null;
    } catch (error) {
      console.error('Error disabling past props:', error);
      return null;
    }
  });

exports.createCompositeNFLGames = functions.pubsub.schedule('6 5 * * 2')
.onRun(async(context)=> {
    const futureNFLGamesSnapshot = await admin.firestore().collection('weeklyOddsAPIGames').get();
    const batchOperations = [];

    for (const doc of futureNFLGamesSnapshot.docs){
        //Each FutureNFLGames day
        const games = doc.data().games;
        //Each game listed in each day
        for (const game of games){
            const matchedGameSnapshot = await admin.firestore().collection('weeklyNFLAPIGames')
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

/**
 * Writes all NFL teams to the database from the NFL API
 * 
 * NOTE: Tested with batching.
 */
exports.getAllTeams = functions.pubsub.schedule('5 5 1 * *') //Runs once a month
.onRun(async()=> {
    const promises = [];
    const teamIDs = [4412, 4413, 4414, 4415, 4416, 4417, 4418, 4419, 4420, 4421, 4422, 4423, 4424, 
        4425, 4426, 4427, 4428, 4429, 4430, 4431, 4432, 4386, 4324, 4287, 4390, 4388, 4389, 4387, 4392,
        4345, 4391, 4393];
    let batch = admin.firestore().batch();
    const batchLimit = 500; //Firestore batch write limit
    let operationCount = 0;
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

            batch.set(teamRef, nflTeam);
            operationCount++;

            if (operationCount === batchLimit){
                await batch.commit();
                batch = admin.firestore().batch();
                operationCount = 0;
            }
            await delay(200);
        }
        if (operationCount > 0){
            await batch.commit();
        }
    }catch (error){
        console.error("Failed to get NFL teams");
    }
});

//NOTE: Tested with batching
exports.getAllPlayers = functions.pubsub.schedule('10 5 1 * *') //Executes once a month.
.onRun(async(context)=> {
    const promises = [];
    const teamIDs = [4412, 4413, 4414, 4415, 4416, 4417, 4418, 4419, 4420, 4421, 4422, 4423, 4424, 
        4425, 4426, 4427, 4428, 4429, 4430, 4431, 4432, 4386, 4324, 4287, 4390, 4388, 4389, 4387, 4392,
        4345, 4391, 4393];
        let batch = admin.firestore().batch();
        const batchLimit = 500;
        let operationCount = 0;
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

                    batch.set(playerRef, player);
                    operationCount++;

                    if (operationCount === batchLimit){
                        await batch.commit();
                        batch = admin.firestore().batch();
                        operationCount = 0;
                    }
                }
                await delay(200);
            }
            if (operationCount > 0){
                await batch.commit();
            }
        }catch (error){
            console.error("Failed to get NFL players");
        }
});

//Have it batch execute
//Find way to group execute
exports.resolveUserProps = functions.pubsub.schedule('59 23 * * 0,1,4')
  .onRun(async()=> {
      const completePlayerProps = await admin.firestore().collection('completePlayerPropProfiles').get();
      const completePropIds = completePlayerProps.docs.map(doc => doc.id);
      const usersRef = admin.firestore().collection('users');
      const usersSnapshot = await usersRef.get();

      let batch = admin.firestore().batch();
      const batchLimit = 500;
      let operationCount = 0;
    try{
        for (const user of usersSnapshot.docs){
            try{
                let addWins = 0;
                let addLosses = 0;
                const activePicksRef = usersRef.doc(user.id).collection('activePicks');
                const activePicksSnapshot = await activePicksRef.get();
                for (const pick of activePicksSnapshot.docs){
                    if (completePropIds.includes(pick.id)){
                        console.log("MATCH:");
                        console.log(pick.data().propId);
                        const propOutcome = await checkUserProp(user.id, pick.id, pick.id);
                        propOutcome ? addWins++ : addLosses++;
                        console.log("Add wins: " + addWins + ", Add losses: " + addLosses);
                    }
                }
                //Update user record
                bulkUpdateRecord(user.id, addWins, addLosses);
            }catch (error){
                //Move to next user if there are no active picks
                console.log("catch: "+ error);
                continue;
            }
        }
    }catch (error) {
        console.log("init catch: "+error);
    } 

  });

exports.checkPropProfileHit = functions.pubsub.schedule('59 23 * * 0,1,4')
.onRun(async()=> {
    const propProfiles = await admin.firestore().collection('pastPlayerPropProfiles').get();
    let batch = admin.firestore().batch();
    const batchLimit = 500;
    let operationCount = 0;
    for (const profile of propProfiles.docs){
        //Check if start time is in future, and if game is live
        if (!isFuture(profile.startTime)){
            await checkPropHit(profile.id, batch);
            operationCount += 2;
            if (operationCount >= batchLimit){
                await batch.commit();
                batch = admin.firestore().batch();
                operationCount = 0;
            }
            await delay(200);
        }
        else continue;
    }
    if (operationCount > 0){
        await batch.commit();
    }
});

exports.removePastNFLGames = functions.pubsub.schedule('0 0 * * 2')
.onRun(async() => {
    const nflGames = await admin.firestore().collection('NFLGames').get();
    const weeklyNFLAPIGames = await admin.firestore().collection("weeklyNFLAPIGames").get();
    let batch = admin.firestore().batch();
    const batchLimit = 500;
    let operationCount = 0;

    for (const game of nflGames.docs){
        if (!isFuture(game.data().start_timestamp)){
            batch.delete(game.ref);
            operationCount++;
            if (operationCount >= batchLimit){
                await batch.commit();
                batch = admin.firestore().batch();
                operationCount = 0;
            }
        }
    }
    for (const game of weeklyNFLAPIGames.docs){
        const date = new Date(game.data().startTimestamp * 1000);
        if (!isFuture(date)){
            batch.delete(game.ref);
            operationCount++;
            if (operationCount >= batchLimit){
                await batch.commit();
                batch = admin.firestore().batch();
                operationCount = 0;
            }
        }
    }

    if (operationCount > 0){
        await batch.commit().then(() => {
            console.log("successfully deleted batch items");
        }).catch(error => {
            console.error("Error deleting the document in batch", error);
        });
    }
});

exports.assignDailyPicks = functions.pubsub.schedule('5 5 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    try {
        let batch = admin.firestore().batch();
        const batchLimit = 500;
        let operationCount = 0;
        const users = await admin.firestore().collection('users').get();

        for (const user of users.docs){
            console.log("uID: " + user.id);
            const picks = await determinePlayerPicks(user.id);
            if (picks.length > 0){
                console.log(picks.length);
                for (const pick of picks){
                    const newPick = admin.firestore().collection('users').doc(user.id).collection('dailyPicks').doc();
                    batch.set(newPick,pick);
                    operationCount++;
                    if (operationCount >= batchLimit){
                        await batch.commit();
                        batch = admin.firestore().batch();
                        operationCount = 0;
                    }
                };
            }
        }
        if (operationCount > 0){
            await batch.commit();
        }
    } catch (error) {
        throw new Error("Failed to get users: " + error);
    }
  });

exports.disablePastDailyProps = functions.pubsub.schedule('every 20 minutes').onRun(async () => {
  try {
    let batch = admin.firestore().batch();
    const batchLimit = 500;
    let operationCount = 0;

    const users = await admin.firestore().collection('users').get();
    users.forEach(async (user) => {
      const dailyPicks = await admin.firestore().collection('users').doc(user.id).collection('dailyPicks').get();
      dailyPicks.forEach(async (pick) => {
        const prop = pick.data();
        const startTime = new Date(prop.startTime);

        if (!isFuture(startTime)){
            const pickDocRef = admin.firestore().collection('users').doc(user.id).collection('dailyPicks').doc(pick.id);
            batch.delete(pickDocRef);
            operationCount++;
            if (operationCount >= batchLimit){
                await batch.commit();
                batch = admin().firestore().batch();
                operationCount = 0;
            }
        }
        
      });
    });
    if (operationCount > 0){
      await batch.commit();
    }
    console.log("Checked props and updated as needed.");
    return null;
  } catch (error) {
    console.error('Error disabling past props:', error);
    return null;
  }
});