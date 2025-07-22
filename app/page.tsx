"use client";
import { checkWord, getWord } from "@/hooks/useApi"
import { useEffect, useState } from "react";

export default function Home() {

  // useEffect( () => {
  //   const timer = setTimeout( async () => {
  //   const word = await getWord();

  //   setHour(word);
  //   }, 60*60*1000);

  //   return () => clearTimeout(timer);
  // }, []);

 
  useEffect(() => {
    async function fetchWord(){
     const word = await getWord();

    setHour(word);
    }

    fetchWord();
  }, []);


  const [hour, setHour] = useState<string>('');
  const [value, setValue] = useState<string[]>(['','','','','']);
 
 

  const wordArray = (hour.split(''));

  // const guess = "ocign";

  // const guessArray = (guess.split(''));

  const result: {letter: string[], position: string[]} = checkWord(wordArray, value)

  

  
  return (
    <>
    <div className="bg-slate-100 text-gray-900 backdrop-blur-sm text-center min-h-screen space-y-5 p-10">
      <h1 className="text-2xl md:text-3xl font-semibold">Hello! Welcome to ETA's Wordle Clone</h1>
      <p className="text-sm md:text-base">ETA stands for Emmanuel Tijesunimi, Akinola</p>

      <div className="flex flex-col items-center justify-center h-full">
      <div className="my-10">
        <h1 className="text-xl font-medium">The Word for the day is </h1>
        <Boxes/>
      </div>

      <div className="my-10">
        <h1 className="text-xl font-medium">Enter Your Guesses</h1>
        <div className="mt-5 grid grid-cols-5 gap-5">
        {[0,1,2,3,4].map((index)=> {
          return <input key={index} type="text" onChange={(e) => ([...value], e.target.value)} maxLength={1} className="w-20 h-20 font-bold text-6xl text-center border border-gray-400 bg-gray-300" />
        })}
        </div>
        <input type="submit" value="Submit" className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => console.log(value)}/>
      </div>
      </div>
    </div>
    </>
  )
}


function Boxes(){
  return (
      <div className="mt-5 grid grid-cols-5 gap-5">
        <div className="w-20 h-20 border border-gray-400 bg-gray-300"></div>
        <div className="w-20 h-20 border border-gray-400 bg-gray-300"></div>
        <div className="w-20 h-20 border border-gray-400 bg-gray-300"></div>
        <div className="w-20 h-20 border border-gray-400 bg-gray-300"></div>
        <div className="w-20 h-20 border border-gray-400 bg-gray-300"></div>
      </div>
  )
}

