export function seededRandom(seed: number) {
    let m=0x80000000; 
    let a=1103515245;
    let c=12345;
    let state = seed;
    return function() {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
}

export function getDailySolution(): number {
    const today = new Date();
    const startDate = new Date(2024, 0, 1); 
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}