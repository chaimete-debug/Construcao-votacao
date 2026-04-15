import { kv } from '@vercel/kv'

export interface VotacaoConfig {
  titulo: string
  descricao: string
  datas: string[]
  horas: string[]
  locais: string[]
  ativa: boolean
  criadaEm: string
}

export interface Voto {
  nome: string
  data: string
  hora: string
  local: string
  timestamp: string
}

const CONFIG_KEY = 'votacao:config'
const VOTOS_KEY = 'votacao:votos'

export async function getConfig(): Promise<VotacaoConfig | null> {
  try {
    const config = await kv.get<VotacaoConfig>(CONFIG_KEY)
    return config
  } catch {
    return null
  }
}

export async function saveConfig(config: VotacaoConfig): Promise<void> {
  await kv.set(CONFIG_KEY, config)
}

export async function getVotos(): Promise<Voto[]> {
  try {
    const votos = await kv.get<Voto[]>(VOTOS_KEY)
    return votos || []
  } catch {
    return []
  }
}

export async function addVoto(voto: Voto): Promise<{ ok: boolean; erro?: string }> {
  const votos = await getVotos()
  const nomeNorm = voto.nome.trim().toLowerCase()
  const jaVotou = votos.find(v => v.nome.trim().toLowerCase() === nomeNorm)
  if (jaVotou) {
    return { ok: false, erro: 'Este nome já votou.' }
  }
  votos.push(voto)
  await kv.set(VOTOS_KEY, votos)
  return { ok: true }
}

export async function resetVotos(): Promise<void> {
  await kv.set(VOTOS_KEY, [])
}
