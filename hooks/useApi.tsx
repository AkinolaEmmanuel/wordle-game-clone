export const getWord = async () => {
    const res = await fetch("http://localhost:3002/api/words");
    const word = await res.json();
    return word.data;
};
export function checkWord(wordArray: string[], guessArray: string[]) {
  const letter = guessArray.map((word) => {
    return wordArray.includes(word) ? word : "blank letter";
  });
  const position = [0,1,2,3,4].map((index) => {
      return letter[index] === wordArray[index] ? letter[index] : "wrong position ,";
    })

    // const letterPosition = [0,1,2,3,4].map((index) => {
    //   return letter[index] == position[index] ? <b key={index} className="text-green">{letter}</b> : <i key={index} className="text-red">{letter}</i>
    // })

    return {letter, position};

}