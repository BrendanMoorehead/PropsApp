export const StatsProvider = () => {
    const calculateWinRate = (wins, losses) => {
        return ((wins / (wins + losses) * 10).toFixed(0)) + "%";
    }
}