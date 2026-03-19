'use client';

import { useState } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useReadContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ConnectKitButton } from 'connectkit';
import { Vote, Plus, Flame, Award, TrendingUp, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';

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
  
  const { data: nextId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'nextPollId',
    watch: true,
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

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
    <div className="min-h-screen bg-[#030014] text-slate-200">
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
          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-10 rounded-[40px] border border-indigo-500/20 relative overflow-hidden">
            <h1 className="text-4xl font-black text-white leading-none mb-4">VOTER POWER PREDICTION</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">The first platform where unique address count decides the winner. Outsmart the whales by coordinating the crowd.</p>
            <div className="flex gap-4">
              <div className="bg-indigo-500/20 px-4 py-2 rounded-xl text-xs font-bold text-indigo-400 flex items-center gap-2 border border-indigo-500/20">
                <Flame className="w-4 h-4" /> TRENDING NOW
              </div>
            </div>
          </div>

          <section className="bg-slate-900/40 p-8 rounded-[32px] border border-slate-800 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Host New Poll
            </h3>
            <div className="space-y-4">
              <textarea 
                placeholder="Ex: Will Base surpass Arbitrum TVL by June?" 
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
                {isConfirming ? 'Lauching...' : 'LAUNCH POLL'}
              </button>
            </div>
          </section>

          <div className="bg-slate-900/40 p-8 rounded-[32px] border border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Top Voters</h3>
            <div className="space-y-4">
              <LeaderboardRow name="0x82...1a2b" wins="42" />
              <LeaderboardRow name="0x3c...d4e5" wins="38" />
              <LeaderboardRow name="0xfe...9821" wins="31" />
            </div>
          </div>
        </div>

        {/* Right: Polls List */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <TrendingUp className="text-indigo-500" /> Active Polls
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-500/20">LIVE: {nextId?.toString() || '0'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[...Array(Number(nextId || 0))].map((_, i) => (
              <PollCard key={i} id={Number(nextId) - 1 - i} contractAddress={CONTRACT_ADDRESS} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ name, wins }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400 font-mono">{name}</span>
      <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black border border-indigo-500/10">{wins} WINS</span>
    </div>
  );
}

function PollCard({ id, contractAddress }) {
  const [bet, setBet] = useState('');
  const { data: poll } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getPollInfo',
    args: [BigInt(id)],
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isProcessing } = useWaitForTransactionReceipt({ hash });

  if (!poll) return null;

  const [q, yesCount, noCount, yesBet, noBet, resolved, winner] = poll;
  const totalVoters = Number(yesCount) + Number(noCount);
  const yesProgress = totalVoters > 0 ? (Number(yesCount) / totalVoters * 100) : 50;
  const noProgress = totalVoters > 0 ? (Number(noCount) / totalVoters * 100) : 50;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-8 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-500/10 rounded-bl-2xl text-[10px] font-black tracking-widest text-indigo-400 border-l border-b border-indigo-500/20">
        #{id} {resolved ? '• ENDED' : '• VOTING'}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-8 pr-20">{q}</h3>

      <div className="space-y-4 mb-8">
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${yesProgress}%` }} />
          <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000" style={{ width: `${noProgress}%` }} />
        </div>
        <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-2 text-emerald-500">
            <ThumbsUp className="w-3 h-3" /> YES: {yesCount.toString()} VOTERS
          </span>
          <span className="flex items-center gap-2 text-red-500">
             NO: {noCount.toString()} VOTERS <ThumbsDown className="w-3 h-3" />
          </span>
        </div>
      </div>

      {!resolved ? (
        <div className="bg-black/20 p-6 rounded-2xl border border-slate-800/50">
          <div className="flex gap-4 mb-4">
            <input 
              type="number" 
              placeholder="Bet Amount ETH" 
              className="flex-1 bg-black/40 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'vote', args: [BigInt(id), true], value: parseEther(bet || '0') })}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 rounded-xl transition-all flex items-center gap-2 text-xs"
              >
                VOTE YES
              </button>
              <button 
                onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'vote', args: [BigInt(id), false], value: parseEther(bet || '0') })}
                className="bg-red-500 hover:bg-red-400 text-white font-black px-6 rounded-xl transition-all flex items-center gap-2 text-xs"
              >
                VOTE NO
              </button>
            </div>
          </div>
          <button 
            onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'resolve', args: [BigInt(id)] })}
            className="w-full py-2 bg-transparent border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-widest uppercase hover:bg-indigo-500/10 rounded-lg transition-all"
          >
            Resolve Poll (Host Only)
          </button>
        </div>
      ) : (
        <div className="bg-indigo-600 p-8 rounded-2xl text-center space-y-4 shadow-2xl shadow-indigo-600/20">
          <Award className="w-12 h-12 text-white mx-auto" />
          <div>
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] block mb-1">Result</span>
            <span className="text-3xl font-black text-white">{winner ? 'YES WON! ✅' : 'NO WON! ❌'}</span>
          </div>
          <button 
            onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'claim', args: [BigInt(id)] })}
            className="w-full bg-white text-indigo-600 font-black py-4 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
          >
            CLAIM WINNINGS <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
