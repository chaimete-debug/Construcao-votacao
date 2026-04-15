import type { NextApiRequest, NextApiResponse } from 'next'
import { getConfig, saveConfig, resetVotos, VotacaoConfig } from '../../lib/store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const config = await getConfig()
    return res.status(200).json({ config })
  }

  if (req.method === 'POST') {
    const { titulo, descricao, datas, horas, locais, senha } = req.body

    if (senha !== process.env.ADMIN_SENHA) {
      return res.status(401).json({ erro: 'Senha incorreta.' })
    }

    if (!titulo || !datas || datas.length < 2) {
      return res.status(400).json({ erro: 'Título e pelo menos 2 datas são obrigatórios.' })
    }

    const config: VotacaoConfig = {
      titulo,
      descricao: descricao || '',
      datas,
      horas: horas || [],
      locais: locais || [],
      ativa: true,
      criadaEm: new Date().toISOString(),
    }

    await saveConfig(config)
    await resetVotos()

    return res.status(200).json({ ok: true })
  }

  res.status(405).end()
}
