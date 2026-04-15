import type { NextApiRequest, NextApiResponse } from 'next'
import { getVotos, addVoto, getConfig, Voto } from '../../lib/store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const votos = await getVotos()
    const config = await getConfig()
    return res.status(200).json({ votos, config })
  }

  if (req.method === 'POST') {
    const { nome, data, hora } = req.body

    if (!nome || !data) {
      return res.status(400).json({ erro: 'Nome e data são obrigatórios.' })
    }

    const config = await getConfig()
    if (!config || !config.ativa) {
      return res.status(400).json({ erro: 'Votação não está ativa.' })
    }

    if (!config.datas.includes(data)) {
      return res.status(400).json({ erro: 'Data inválida.' })
    }

    if (config.horas && config.horas.length > 0 && !config.horas.includes(hora)) {
      return res.status(400).json({ erro: 'Hora inválida.' })
    }

    const voto: Voto = {
      nome: nome.trim(),
      data,
      hora: hora || '',
      timestamp: new Date().toISOString(),
    }

    const resultado = await addVoto(voto)
    if (!resultado.ok) {
      return res.status(400).json({ erro: resultado.erro })
    }

    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}
