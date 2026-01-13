'use client';

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useLogin } from '@/hooks/useApi';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<{ id: string, name: string } | null>(null);
  const login = useLogin();

  useEffect(() => {
    const savedUser = localStorage.getItem('wordle_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      const response = await login.mutateAsync(username);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('wordle_user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('wordle_user');
    setUsername('');
  };

  return (
    <div className="bg-background min-h-screen flex flex-col justify-center items-center text-center gap-y-10 p-5">
      <h1 className='text-3xl md:text-4xl font-semibold'>Welcome to ETA Games!</h1>
      <p className='max-w-2xl text-xs md:text-base'>
        This is a guess game of words and numbers where you guess a 5 letter number or word against a randomized computer word or arrangement of numbers that changes daily. Good luck!
      </p>

      {!user ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4 md:w-full max-w-2xs md:max-w-sm">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-white transition-colors"
          />
          <button
            type="submit"
            disabled={login.isPending || !username.trim()}
            className="px-7 py-3 text-base bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {login.isPending ? <Loader2 className="animate-spin" /> : 'Start Playing'}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="text-xl">
            Welcome, <span className="font-bold">{user.name}</span>!
          </div>
          
          <div className="flex gap-x-5">
            <Link href={`/words?userId=${user.id}`}>
              <button className='p-3 md:px-7 md:py-3 text-base border border-white cursor-pointer hover:bg-white/10 transition-colors rounded-md'>
                Play Words
              </button>
            </Link>
            <Link href={`/numbers?userId=${user.id}`}>
              <button className='p-3 md:px-7 md:py-3 text-base bg-white text-black cursor-pointer hover:bg-gray-200 transition-colors rounded-md'>
                Play Numbers
              </button>
            </Link>
          </div>

          <button 
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors underline"
          >
            Login as a new account
          </button>
        </div>
      )}
    </div>
  )
}
