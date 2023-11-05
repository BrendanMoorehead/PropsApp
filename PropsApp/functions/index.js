
 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const axios = require('axios');
const { connectFirestoreEmulator } = require('firebase/firestore');

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
 
         await admin.firestore().collection('futureNflGames').doc(getNextMonday()).set(monGames);
         await admin.firestore().collection('futureNflGames').doc(getNextThursday()).set(thursGames);
         await admin.firestore().collection('futureNflGames').doc(getNextSunday()).set(sunGames);
 
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
        const gameDays = await admin.firestore().collection('futureNflGames').get();
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
 

function getNextSunday(){
    const now = new Date();
    //Sunday is 0
    const dayOfWeek = now.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysUntilSunday);
    return sunday.toISOString().split('T')[0];
}
function getNextMonday(){
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = (1 + 7 - dayOfWeek) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysUntilMonday);
    return monday.toISOString().split('T')[0];
}
function getNextThursday(){
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilThursday = (4 + 7 - dayOfWeek) % 7;
    const thursday = new Date(now);
    thursday.setDate(now.getDate() + daysUntilThursday);
    return thursday.toISOString().split('T')[0];
}

function getHandicap(outcomeObj) {
    if (typeof outcomeObj !== 'object' || outcomeObj === null){
        throw new Error("Object is wrong type or undefined.");
    }
    // Get the outcome handicap.
    const handicap = outcomeObj.handicap;
    if (handicap === null || handicap.length === 0) throw new Error("No outcome description.");
    return handicap;
}
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

function formatMarketKey(marketKey) {
    if (typeof marketKey !== 'string' || marketKey === null){
        throw new Error("Market key is not a string or undefined.");
    }
    //Removes underscores and capitalizes the first letter of each word.
    return marketKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}
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

const removeZeroHandicaps = (market) => {
    if (!market || !Array.isArray(market.outcomes)){
        throw new Error("Invalid market object.");
    }
    const nonZeroHandicaps = [];
    const handicaps = new Set();
    for (const outcome of market.outcomes){
        if (outcome.handicap !== '0'){
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
          const gameStartTime = await getDateByGameID(gameId);
          const market = await retrieveSingleMarket(gameId);
          for (const outcome of market.outcomes) {
            const playerName = getPlayerName(outcome);
            const handicap = getHandicap(outcome);

            const profile = {
              playerName: playerName,
              handicap: handicap,
              gameId: gameId,
              startTime: gameStartTime,
              enabled: true
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
    //Get the upcoming game days
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
        // console.log(response.data);

        for (const game of response.data.events){
            if (game.tournament.name === "NFL"){
                console.log(day + "NFL GAME!!!");
            }
        }
    }
  });

  const convertDateFormat = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  const getDateByGameID = async (gameId) => {
    try{
        const futureNflGamesCollection = admin.firestore().collection('futureNflGames');
        const snapshot = await futureNflGamesCollection.get();

        for (const doc of snapshot.docs){
            const games = doc.data().games;
            const game = games.find(g => g.game_id === gameId);
            if (game) {
                return game.start_timestamp;
            }
        }
        return null;
      } catch (e){
        throw new Error ("Failed to load documents for game: " + gameId);
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