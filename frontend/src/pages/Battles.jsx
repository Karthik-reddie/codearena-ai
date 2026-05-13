import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swords, Plus, Users, Clock, Zap } from 'lucide-react'
import { fetchActiveBattles, createBattle, joinBattle } from '../store/slices/battleSlice'

export default function Battles() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { activeBattles, loading } = useSelector((s) => s.battles)
  const [joinCode, setJoinCode] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [challengeId, setChallengeId] = useState(1)

  useEffect(() => {
    dispatch(fetchActiveBattles())
  }, [dispatch])

  const handleCreate = () => {
    dispatch(createBattle({ challenge_id: challengeId })).then((res) => {
      if (res.payload?.room_code) navigate(`/battles/${res.payload.room_code}`)
    })
  }

  const handleJoin = () => {
    if (!joinCode) return
    dispatch(joinBattle(joinCode)).then((res) => {
      if (res.payload?.room_code) navigate(`/battles/${res.payload.room_code}`)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="text-primary" /> Battle Arena</h1>
          <p className="text-gray-400 mt-1">Challenge other coders in real-time coding battles</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Battle
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card">
          <h3 className="font-semibold mb-4">Create New Battle</h3>
          <div className="flex gap-4">
            <input type="number" min={1} className="input-field w-40" placeholder="Challenge ID" value={challengeId} onChange={(e) => setChallengeId(Number(e.target.value))} />
            <button onClick={handleCreate} className="btn-primary">Create & Wait</button>
          </div>
        </motion.div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-4">Join Battle by Code</h3>
        <div className="flex gap-4">
          <input type="text" className="input-field flex-1" placeholder="Enter room code..." value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button onClick={handleJoin} className="btn-primary">Join</button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-warning" /> Open Battles
        </h3>
        {activeBattles?.length > 0 ? (
          <div className="grid gap-3">
            {activeBattles.map((battle) => (
              <motion.div key={battle.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Swords size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Battle #{battle.id}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Users size={14} /> 1/2 players</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {battle.time_limit_seconds / 60}min</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { dispatch(joinBattle(battle.room_code)); navigate(`/battles/${battle.room_code}`) }} className="btn-primary text-sm py-1.5">
                  Join Battle
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Swords size={48} className="mx-auto mb-4 opacity-30" />
            <p>No open battles right now. Create one!</p>
          </div>
        )}
      </div>
    </div>
  )
}
