'use client';

import React, { useState, useEffect } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import idl from '@/lib/idl.json';
import Link from 'next/link';
import Image from 'next/image';

const programId = new PublicKey('Hzgm1oJcrME6x3qw2nRKc7ogT7uz52ixdFhHQNPancyf');

function Models() {
  const [entries, setEntries] = useState<Array<{ title: string; message: string; owner: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (connected && anchorWallet) {
      fetchAllModels();
    } else {
      setEntries([]);
    }
  }, [connected, anchorWallet, publicKey]);

  const fetchAllModels = async () => {
    if (!anchorWallet) return;

    const provider = new AnchorProvider(connection, anchorWallet, {});
    const program = new Program(idl as Idl, programId, provider);

    try {
      const allEntries = await program.account.modelEntryState.all();

      const formattedEntries = allEntries.map(entry => ({
        title: entry.account.title,
        message: entry.account.message,
        owner: entry.account.owner.toString(),
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col pb-15">
      <div className='flex mb-10 gap-3 justify-end w-[98%]'>
        <div className="search-container relative top-3">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 ml-10 sm:ml-[25%] gap-5 content-start w-[60vw]">
        {!connected ? (
          <p className="text-gray-400 col-span-full text-center">Please connect your wallet to view models.</p>
        ) : filteredEntries.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center">No models found. Create some models first!</p>
        ) : (
          filteredEntries.reverse().map((entry, index) => (
            <Link href={`/dashboard/${encodeURIComponent(entry.title)}`} key={index}>
              <div className="bg-[#0d0c0c] rounded-md shadow-md p-2 px-5 w-full flex flex-col h-[65px]">
                <div className='flex gap-3'>
                <Image src="/ai.png" width={20} height={20} alt={''} className='py-1' />
                <h3 className="text-xl font-medium text-white">{entry.title}</h3>
                </div>
                <div>
                <p className="text-gray-400 font-light text-sm overflow-hidden ">{entry.message}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Models;
