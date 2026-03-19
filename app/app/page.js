'use client';

import { useState, useEffect } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useReadContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ConnectKitButton } from 'connectkit';
import { Vote, Plus, Flame, Award, TrendingUp, ThumbsUp, ThumbsDown, CheckCircle2, ArrowRight } from 'lucide-react';

const CONTRACT_ADDRESS = "0xa82D6cF2C339105725B9466e2DCDc9FA7FEd2f8A";
const ABI = [
  {
    "name": "nextPollId",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "getPollInfo",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"type": "uint256", "name": "_id"}],
    "outputs": [
      {"type": "string", "name": "question"},
      {"type": "uint256", "name": "yesVotersCount"},
      {"type": "uint256", "name": "noVotersCount"},
      {"type": "uint256", "name": "totalYesBet"},
      {"type": "uint256", "name": "totalNoBet"},
      {"type": "bool", "name": "resolved"},
      {"type": "bool", "name": "winnerOutcome"}
    ]
  },
  {
    "name": "createPoll",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{"type": "string", "name": "_question"}],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "vote",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [{"type": "uint256", "name": "_id"}, {"type": "bool", "name": "_side"}],
    "outputs": []
  },
  {
    "name": "resolve",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{"type": "uint256", "name": "_id"}],
    "outputs": []
  },
  {
    "name": "claim",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{"type": "uint256", "name": "_id"}],
    "outputs": []
  }
];

export default function Home() {
  const { isConnected } = useAccount();
  const [question, setQuestion] = useState('');
  
  const { data: nextId, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'nextPollId',
    query: { enabled: isConnected }
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setQuestion('');
    }
  }, [isSuccess, refetch]);

  const handleCreate = async () => {
    if (!question) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'createPoll',
      args: [question],
    });
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-indigo-500/20 backdrop-blur-md sticky top-0 z-50 py-4 px-8 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <Vote className="text-indigo-500 w-8 h-8" />
          <span className="text-2xl font-black tracking-tighter text-white">BASE<span className="text-indigo-500">VOTE</span></span>
        </div>
        <ConnectKitButton />
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-12 gap-8">
        {/* Left: Hero & Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-10 rounded-[40px] border border-indigo-500/20 relative overflow-hidden shadow-2xl">
            <h1 className="text-4xl font-black text-white leading-none mb-4 tracking-tighter">VOTER POWER DEFAULTS</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">Participate in decentralized governance where every unique address holds equal power. Payouts are won by the majority side.</p>
            <div className="flex gap-4">
              <div className="bg-indigo-500/20 px-4 py-2 rounded-xl text-xs font-bold text-indigo-400 flex items-center gap-2 border border-indigo-500/20 tracking-widest">
                <Flame className="w-4 h-4" /> MAINNET LIVE
              </div>
            </div>
          </div>

          {!isConnected ? (
             <div className="bg-slate-900/40 p-10 rounded-[40px] border border-slate-800 text-center">
                 <h3 className="text-white font-bold mb-4">Connect to Vote</h3>
                 <p className="text-slate-500 text-xs mb-6">Use the Project 1 standard wallet bridge to access on-chain governance.</p>
                 <ConnectKitButton />
             </div>
          ) : (
            <section className="bg-slate-900/40 p-8 rounded-[32px] border border-slate-800 backdrop-blur-sm shadow-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-indigo-500" /> Host New Poll
                </h3>
                <div className="space-y-4">
                <textarea 
                    placeholder="Ex: Will Base achieve 1B TVL this quarter?" 
                    rows={3}
                    className="w-full bg-black/40 border border-slate-700 rounded-2xl p-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm text-white resize-none"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <button 
                    onClick={handleCreate}
                    disabled={isConfirming}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
                >
                    {isConfirming ? 'Deploying...' : 'LAUNCH PROPOSAL'}
                </button>
                </div>
            </section>
          )}

          <div className="bg-slate-900/40 p-8 rounded-[32px] border border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Global Statistics</h3>
            <div className="space-y-4">
                <StatRow label="Active Polls" value={nextId?.toString() || '0'} />
                <StatRow label="Network" value="Base Mainnet" />
            </div>
          </div>
        </div>

        {/* Right: Polls List */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <TrendingUp className="text-indigo-500" /> Live Proposals
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {nextId && [...Array(Math.min(Number(nextId), 10))].map((_, i) => (
              <PollCard key={i} id={Number(nextId) - 1 - i} contractAddress={CONTRACT_ADDRESS} isConnected={isConnected} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-500 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-indigo-400 font-black">{value}</span>
    </div>
  );
}

function PollCard({ id, contractAddress, isConnected }) {
  const [bet, setBet] = useState('');
  const { data: poll, refetch } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getPollInfo',
    args: [BigInt(id)],
    query: { enabled: isConnected }
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isProcessing, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setBet('');
    }
  }, [isSuccess, refetch]);

  if (!poll) return null;

  const [q, yesCount, noCount, yesBet, noBet, resolved, winner] = poll;
  const totalVoters = Number(yesCount) + Number(noCount);
  const yesProgress = totalVoters > 0 ? (Number(yesCount) / totalVoters * 100) : 50;
  const noProgress = totalVoters > 0 ? (Number(noCount) / totalVoters * 100) : 50;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-8 hover:border-indigo-500/30 transition-all group relative shadow-xl overflow-hidden">
      <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-500/10 rounded-bl-2xl text-[10px] font-black tracking-[0.2em] text-indigo-400 border-l border-b border-indigo-500/20">
        #{id} {resolved ? '• FINALIZED' : '• ACTIVE'}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-8 pr-20 leading-snug">{q}</h3>

      <div className="space-y-4 mb-10">
        <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner p-0.5 border border-white/5">
          <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${yesProgress}%` }} />
          <div className="h-full bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-1000 ml-auto" style={{ width: `${noProgress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded">
            <ThumbsUp className="w-3 h-3" /> YES: {yesCount.toString()} VOTERS
          </span>
          <span className="flex items-center gap-2 text-red-500 bg-red-500/5 px-2 py-1 rounded">
             NO: {noCount.toString()} VOTERS <ThumbsDown className="w-3 h-3" />
          </span>
        </div>
      </div>

      {!resolved ? (
        <div className="bg-black/20 p-6 rounded-[24px] border border-slate-800/50">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input 
              type="number" 
              placeholder="Bet Amount ETH" 
              step="0.01"
              className="flex-1 bg-black/40 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm text-white"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'vote', args: [BigInt(id), true], value: parseEther(bet || '0') })}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] tracking-widest"
              >
                VOTE YES
              </button>
              <button 
                onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'vote', args: [BigInt(id), false], value: parseEther(bet || '0') })}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-black px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] tracking-widest"
              >
                VOTE NO
              </button>
            </div>
          </div>
          <button 
            onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'resolve', args: [BigInt(id)] })}
            className="w-full py-2.5 bg-transparent border border-indigo-500/20 text-indigo-400 text-[9px] font-black tracking-[0.3em] uppercase hover:bg-indigo-500/10 rounded-xl transition-all"
          >
            AUTHORIZE RESOLUTION
          </button>
        </div>
      ) : (
        <div className="bg-indigo-600 p-8 rounded-[24px] text-center space-y-6 shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <Award className="w-16 h-16 text-white mx-auto animate-bounce" />
          <div>
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] block mb-2">Outcome Certified</span>
            <span className="text-4xl font-black text-white">{winner ? 'YES SIDE WON' : 'NO SIDE WON'}</span>
          </div>
          <button 
            onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'claim', args: [BigInt(id)] })}
            className="w-full bg-white text-indigo-600 font-black py-4 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            CLAIM YOUR REWARDS <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
