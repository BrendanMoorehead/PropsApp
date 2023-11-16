
 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const axios = require('axios');

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
 
/**
 * Gets the date of upcoming Sunday.
 * 
 * @returns the date in YYYY-MM-DD format.
 */
function getNextSunday(){
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Sunday in number format is 0.
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysUntilSunday);
    return sunday.toISOString().split('T')[0];
}

/**
 * Gets the date of upcoming Monday.
 * 
 * @returns the date in YYYY-MM-DD format.
 */
function getNextMonday(){
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Monday in number format is 1.
    const daysUntilMonday = (1 + 7 - dayOfWeek) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysUntilMonday);
    return monday.toISOString().split('T')[0];
}

/**
 * Gets the date of upcoming Thursday.
 * 
 * @returns the date in YYYY-MM-DD format.
 */
function getNextThursday(){
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Thursday in number format is 4.
    const daysUntilThursday = (4 + 7 - dayOfWeek) % 7;
    const thursday = new Date(now);
    thursday.setDate(now.getDate() + daysUntilThursday);
    return thursday.toISOString().split('T')[0];
}

/**
 * Gets the O/U handicap for a given outcome.
 * @param {*} outcomeObj An outcome object from a playerProps document.
 * @returns The handicap (O/U number for prop).
 */
function getHandicap(outcomeObj) {
    if (typeof outcomeObj !== 'object' || outcomeObj === null){
        throw new Error("Object is wrong type or undefined.");
    }
    // Get the outcome handicap.
    const handicap = outcomeObj.handicap;
    if (handicap === null || handicap.length === 0) throw new Error("No outcome description.");
    return handicap;
}

/**
 * Gets the player's name for a given outcome.
 * 
 * NOTE: Name extraction is based on the FanDuel markets.
 * 
 * @param {*} outcomeObj An outcome object from a playerProps document.
 * @returns The name of the player for the given outcome.
 */
function getPlayerName(outcomeObj){
    if (typeof outcomeObj !== 'object' || outcomeObj === null){
        throw new Error("Object is wrong type or undefined.");
    }
    // Get the outcome description.
    const desc = outcomeObj.description;
    if (desc === null || desc.length === 0) throw new Error("No outcome description.");

    // Extract the player name from the outcome description.
    const playerName = desc.split(' -')[0];
    if (playerName === null || playerName.length === 0) throw new Error("Player name extraction failed.");

    return playerName;
}
/**
 * Removes underscores from a market key to make it more readable.
 * 
 * @param {*} marketKey An underscore delimted string describing the prop market.
 * @returns The formatted market key.
 */
async function formatMarketKey(marketKey) {
    if (typeof marketKey !== 'string' || marketKey === null){
        throw new Error("Market key is not a string or undefined.");
    }
    //Removes underscores and capitalizes the first letter of each word.
    return marketKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Gets a market for a given game.
 * 
 * @param {*} gameID A game ID from the Odds API.
 * @returns A document of the market for a given game.
 */
const retrieveSingleMarket = async (gameID) => {
    if (typeof gameID !== 'string' || gameID.trim() === ''){
        throw new Error("Invalid or nonexistent game ID provided.");
    }
    try{
        const docRef = admin.firestore().collection('playerProps').doc(gameID);
        const docSnap = await docRef.get();

        if (!docSnap.exists) throw new Error("Document not found for gameID: " + gameID);

        const data = docSnap.data();

        if (!Array.isArray(data.sportsbooks) || data.sportsbooks.length === 0) { 
            throw new Error("No sportsbooks found for gameID: " + gameID);
        }
        return removeDuplicateOutcomes(removeZeroHandicaps(data.sportsbooks[0].market)) || null;
    } catch (e){
        throw new Error ("Failed to retrieve document for gameID: " + gameID + e);
    }
}

/**
 * Removes duplicate outcomes from a given market.
 * 
 * @param {*} market An object representing a Odds API market.
 * @returns A market object without the duplicate outcomes.
 */
const removeDuplicateOutcomes = (market) => {
    if (!market || !Array.isArray(market.outcomes)){
        throw new Error("Invalid market object.");
    }
    const uniqueOutcomes = [];
    const descriptions = new Set();
    for (const outcome of market.outcomes){
        if (!descriptions.has(outcome.description)){
            descriptions.add(outcome.description);
            uniqueOutcomes.push(outcome);
        }
    }
    return {...market, outcomes: uniqueOutcomes};
}

/**
 * Removes outcomes with a 0 handicap (O/U line).
 * This is needed as alternate betting lines (higher or lower) are sometimes included in the market object.
 * 
 * @param {*} market An object representing a Odds API market.
 * @returns A market object without zero handicap outcomes.
 */
const removeZeroHandicaps = (market) => {
    if (!market || !Array.isArray(market.outcomes)){
        throw new Error("Invalid market object.");
    }
    const nonZeroHandicaps = [];
    const handicaps = new Set();
    for (const outcome of market.outcomes){
        if (Number(outcome.handicap) !== 0){
            handicaps.add(outcome.handicap);
            nonZeroHandicaps.push(outcome);
        }
    }
    return {...market, handicaps: nonZeroHandicaps};
}

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
          const market = await retrieveSingleMarket(gameId);
          for (const outcome of market.outcomes) {
            const playerName = getPlayerName(outcome);
            const handicap = getHandicap(outcome);
            const playerDoc = await findPlayerByName(playerName);

            if (!playerDoc) {
                console.error(`Player not found: ${playerName}`);
                // Handle the case when player is not found
                return;
            }

            const profile = {
              playerName: playerName,
              marketKey: market.market_key,
              handicap: handicap,
              gameId: gameId,
              startTime: gameStartTime,
              playerId: playerDoc.data.player.id
            }
    
            const docId = `${gameId}_${playerName}_${market.market_key}`;
            promises.push(admin.firestore().collection('futurePlayerPropProfiles').doc(docId).set(profile));
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
                await promises.push(gameRef.set(game));
            }
        }
        await Promise.all(promises);
    } catch (error) {
        throw new Error("Failed to get NFLAPI games: "  + error.message);
    }
  });

  const convertDateFormat = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
/**
 * Gets the starting timestamp of a game.
 * 
 * @param {*} gameId An Odds API game ID.
 * @returns The starting timestamp of the game or null if the game doesn't exist.
 */
  const getTimestampByGameID = async (gameId) => {
    try{
        const futureNflGamesCollection = admin.firestore().collection('futureNflGameDays');
        const snapshot = await futureNflGamesCollection.get();

        for (const doc of snapshot.docs){
            const games = doc.data().games;
            const game = games.find(g => g.game_id === gameId);
            if (game) {
                return game.start_timestamp;
            }
        }
        return null;
      } catch (e) {
        throw new Error ("Failed to load documents for game: " + gameId + "Error: " + e);
      }
  }

  exports.disablePastProps = functions.pubsub.schedule('every 20 minutes').onRun(async (context) => {
      const now = new Date();
      const propsCollection = admin.firestore().collection('futurePlayerPropProfiles');

      const querySnapshot = await propsCollection.where('enabled', '==', true).get();

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


/**
 * Delays for the specified amount of time.
 * @param {*} ms The amount of milliseconds to delay.
 * @returns A promise that resolves after the delay has elapsed.
 */
function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Finds the player document given the player's name.
 * @param {*} playerName A space separated name on an existing NFL roster.
 * @returns The player's document or null if the player is not found.
 */
const findPlayerByName = async (playerName) => {
    const playersRef = admin.firestore().collection('nflPlayers');
    const snapshot = await playersRef.get();

    let foundPlayer = null;

    snapshot.forEach(doc => {
        const player = doc.data();
        if (player.player && player.player.name == playerName){
            foundPlayer = {id: doc.id, data: doc.data()};
        }
    });
    return foundPlayer;
}

