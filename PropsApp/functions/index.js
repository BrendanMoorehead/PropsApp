/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const axios = require('axios');
 
 admin.initializeApp();
 
 exports.getNFLGames = functions.pubsub.schedule('0 16 * * 2') // Every Tuesday at 10:00 AM
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
 
         await admin.firestore().collection('nflGames').doc(getNextMonday()).set(monGames);
         await admin.firestore().collection('nflGames').doc(getNextThursday()).set(thursGames);
         await admin.firestore().collection('nflGames').doc(getNextSunday()).set(sunGames);
 
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
        const gameDays = await admin.firestore().collection('nflGames').get();
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