import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sword, Shield, Heart, Zap, RefreshCw } from 'lucide-react'
import { llmService } from '../services/llmService'

interface BattleMonster {
  id: string
  name: string
  hp: number
  maxHp: number
  moves: string[]
  visual_description: string
}

interface BattleLog {
  id: string
  message: string
  timestamp: Date
  type: 'action' | 'damage' | 'heal' | 'system'
}

const BattlePage: React.FC = () => {
  const { llmonster } = useAuth()
  const [playerMonster, setPlayerMonster] = useState<BattleMonster | null>(null)
  const [enemyMonster, setEnemyMonster] = useState<BattleMonster | null>(null)
  const [battleLog, setBattleLog] = useState<BattleLog[]>([])
  const [guidance, setGuidance] = useState('')
  const [selectedMove, setSelectedMove] = useState('')
  const [battleActive, setBattleActive] = useState(false)
  const [playerTurn, setPlayerTurn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null)

  useEffect(() => {
    if (llmonster) {
      setPlayerMonster({
        id: llmonster.id,
        name: llmonster.name,
        hp: 1000,
        maxHp: 1000,
        moves: llmonster.moves,
        visual_description: llmonster.visual_description
      })
    }
  }, [llmonster])

  const startBattle = async () => {
    if (!playerMonster) return

    setLoading(true)
    
    // Generate random enemy
    const enemies = [
      { name: 'Shadow Wolf', description: 'A mysterious wolf with dark powers' },
      { name: 'Fire Dragon', description: 'A fierce dragon breathing flames' },
      { name: 'Ice Phoenix', description: 'A majestic bird with ice abilities' },
      { name: 'Thunder Beast', description: 'An electric creature crackling with energy' },
      { name: 'Crystal Golem', description: 'A massive creature made of living crystal' }
    ]
    
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
    
    const enemy: BattleMonster = {
      id: 'enemy-' + Date.now(),
      name: randomEnemy.name,
      hp: 1000,
      maxHp: 1000,
      moves: ['Shadow Strike', 'Power Blast', 'Quick Attack', 'Defend', 'Heal'],
      visual_description: randomEnemy.description
    }

    setEnemyMonster(enemy)
    setBattleLog([{
      id: '1',
      message: `A wild ${enemy.name} appears! The battle begins!`,
      timestamp: new Date(),
      type: 'system'
    }])
    setBattleActive(true)
    setPlayerTurn(true)
    setBattleResult(null)
    setLoading(false)
  }

  const executeMove = async () => {
    if (!selectedMove || !playerMonster || !enemyMonster || !playerTurn) return

    setLoading(true)
    
    try {
      // Get AI-generated battle action description
      const playerActionDescription = await llmService.generateBattleAction(
        llmonster?.system_prompt || '',
        selectedMove,
        guidance
      )
      
      // Simulate battle mechanics
      const playerDamage = Math.floor(Math.random() * 150) + 50 // 50-200 damage
      const enemyDamage = Math.floor(Math.random() * 150) + 50 // 50-200 damage
      
      const newEnemyHp = Math.max(0, enemyMonster.hp - playerDamage)
      const newPlayerHp = Math.max(0, playerMonster.hp - enemyDamage)
      
      // Update monster HP
      setPlayerMonster(prev => prev ? { ...prev, hp: newPlayerHp } : null)
      setEnemyMonster(prev => prev ? { ...prev, hp: newEnemyHp } : null)

      // Add battle log entries
      const newLogs: BattleLog[] = [
        {
          id: Date.now().toString(),
          message: `${playerMonster.name} ${playerActionDescription} (${playerDamage} damage!)`,
          timestamp: new Date(),
          type: 'action'
        }
      ]

      const battleEnded = newEnemyHp <= 0 || newPlayerHp <= 0

      if (!battleEnded) {
        const enemyMove = enemyMonster.moves[Math.floor(Math.random() * enemyMonster.moves.length)]
        newLogs.push({
          id: (Date.now() + 1).toString(),
          message: `${enemyMonster.name} uses ${enemyMove} and deals ${enemyDamage} damage!`,
          timestamp: new Date(),
          type: 'action'
        })
      }

      if (battleEnded) {
        const winner = newPlayerHp > newEnemyHp ? 'win' : 'lose'
        newLogs.push({
          id: (Date.now() + 2).toString(),
          message: `Battle ended! ${winner === 'win' ? 'You win!' : 'You lose!'}`,
          timestamp: new Date(),
          type: 'system'
        })
        setBattleActive(false)
        setBattleResult(winner)
      }

      setBattleLog(prev => [...prev, ...newLogs])
      setSelectedMove('')
      setPlayerTurn(!battleEnded)
    } catch (error) {
      console.error('Error executing move:', error)
      // Fallback to simple description if AI fails
      const fallbackLogs: BattleLog[] = [{
        id: Date.now().toString(),
        message: `${playerMonster.name} uses ${selectedMove}! (AI description unavailable)`,
        timestamp: new Date(),
        type: 'action'
      }]
      setBattleLog(prev => [...prev, ...fallbackLogs])
      setSelectedMove('')
    } finally {
      setLoading(false)
    }
  }

  const resetBattle = () => {
    setEnemyMonster(null)
    setBattleLog([])
    setBattleActive(false)
    setBattleResult(null)
    setPlayerTurn(true)
    if (playerMonster) {
      setPlayerMonster(prev => prev ? { ...prev, hp: prev.maxHp } : null)
    }
  }

  const getHpPercentage = (hp: number, maxHp: number) => {
    return Math.max(0, (hp / maxHp) * 100)
  }

  const getHpColor = (percentage: number) => {
    if (percentage > 60) return 'bg-green-500'
    if (percentage > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Battle Arena</h1>
        <p className="text-gray-300">Challenge randomly generated opponents with AI-powered battle descriptions!</p>
      </div>

      {!battleActive && !enemyMonster && (
        <div className="text-center">
          <button
            onClick={startBattle}
            disabled={loading || !playerMonster}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Finding Opponent...' : 'Start Battle'}
          </button>
        </div>
      )}

      {(playerMonster && enemyMonster) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Monster */}
          <div className="battle-card p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">{playerMonster.name}</h3>
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Sword className="h-12 w-12 text-white" />
              </div>
              <div className="hp-bar mb-2">
                <div 
                  className={`hp-fill ${getHpColor(getHpPercentage(playerMonster.hp, playerMonster.maxHp))}`}
                  style={{ width: `${getHpPercentage(playerMonster.hp, playerMonster.maxHp)}%` }}
                />
              </div>
              <p className="text-gray-300 text-sm">{playerMonster.hp} / {playerMonster.maxHp} HP</p>
            </div>

            {battleActive && playerTurn && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Battle Guidance (for AI)
                  </label>
                  <textarea
                    value={guidance}
                    onChange={(e) => setGuidance(e.target.value)}
                    placeholder="Guide your monster's fighting style..."
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Choose Move
                  </label>
                  <div className="space-y-2">
                    {playerMonster.moves.map((move) => (
                      <button
                        key={move}
                        onClick={() => setSelectedMove(move)}
                        className={`w-full p-2 rounded text-sm transition-colors ${
                          selectedMove === move
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {move}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={executeMove}
                  disabled={!selectedMove || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded transition-all disabled:opacity-50"
                >
                  {loading ? 'Executing...' : 'Execute Move'}
                </button>
              </div>
            )}
          </div>

          {/* Battle Log */}
          <div className="battle-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Battle Log
            </h3>
            <div className="battle-log space-y-2">
              {battleLog.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded text-sm ${
                    log.type === 'system' 
                      ? 'bg-blue-900/50 text-blue-200'
                      : log.type === 'damage'
                      ? 'bg-red-900/50 text-red-200'
                      : 'bg-gray-700/50 text-gray-200'
                  }`}
                >
                  {log.message}
                </div>
              ))}
            </div>

            {battleResult && (
              <div className="mt-4 text-center">
                <div className={`text-2xl font-bold mb-4 ${
                  battleResult === 'win' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {battleResult === 'win' ? 'Victory!' : 'Defeat!'}
                </div>
                <button
                  onClick={resetBattle}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded transition-all"
                >
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  New Battle
                </button>
              </div>
            )}
          </div>

          {/* Enemy Monster */}
          <div className="battle-card p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">{enemyMonster.name}</h3>
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <div className="hp-bar mb-2">
                <div 
                  className={`hp-fill ${getHpColor(getHpPercentage(enemyMonster.hp, enemyMonster.maxHp))}`}
                  style={{ width: `${getHpPercentage(enemyMonster.hp, enemyMonster.maxHp)}%` }}
                />
              </div>
              <p className="text-gray-300 text-sm">{enemyMonster.hp} / {enemyMonster.maxHp} HP</p>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">{enemyMonster.visual_description}</p>
              {!playerTurn && battleActive && (
                <div className="text-yellow-400 text-sm">
                  Enemy is thinking...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BattlePage