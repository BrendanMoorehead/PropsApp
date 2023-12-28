
export const calculateWinRate = (wins, losses) => 
(((wins / (wins + losses) * 10).toFixed(0)) + "%");


export const getUserWins = async () => {
    try{
        const collRef = collection(FIRESTORE_DB, 'futurePlayerPropProfiles');
        const q = query(collRef);
        const querySnapshot = await getDocs(q);

        const documents = [];

        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        return documents;
    } catch (e) {
        throw new Error("Failed to retrieve prop profiles");
    }
}