import { useState, useEffect } from 'react'
import Head from 'next/head'

interface Config {
  titulo: string
  descricao: string
  datas: string[]
  ativa: boolean
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia))
  return { diaSemana: dias[d.getDay()], dia, mesNome: meses[Number(mes) - 1], ano }
}

export default function Votar() {
  const [config, setConfig] = useState<Config | null>(null)
  const [nome, setNome] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'sucesso' | 'erro'>('idle')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => {
        setConfig(d.config)
        setCarregando(false)
      })
  }, [])

  async function votar() {
    if (!nome.trim() || !dataSelecionada) return
    setEstado('enviando')
    const res = await fetch('/api/votos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome.trim(), data: dataSelecionada }),
    })
    const data = await res.json()
    if (data.ok) {
      setEstado('sucesso')
      setMensagem('O teu voto foi registado!')
    } else {
      setEstado('erro')
      setMensagem(data.erro || 'Erro ao votar.')
    }
  }

  const estilos = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .card { background: white; border-radius: 16px; padding: 2rem; max-width: 480px; width: 100%; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    h1 { font-size: 22px; font-weight: 600; color: #111; margin-bottom: 0.5rem; }
    .desc { font-size: 14px; color: #666; margin-bottom: 2rem; line-height: 1.5; }
    label { display: block; font-size: 13px; font-weight: 500; color: #444; margin-bottom: 6px; }
    input[type=text] { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; outline: none; transition: border 0.15s; }
    input[type=text]:focus { border-color: #7F77DD; box-shadow: 0 0 0 3px rgba(127,119,221,0.15); }
    .datas { display: grid; gap: 8px; margin: 1.5rem 0; }
    .data-btn { background: white; border: 1.5px solid #e5e5e5; border-radius: 10px; padding: 14px 16px; cursor: pointer; text-align: left; transition: all 0.15s; display: flex; align-items: center; gap: 14px; }
    .data-btn:hover { border-color: #7F77DD; background: #f8f7ff; }
    .data-btn.selecionada { border-color: #7F77DD; background: #f8f7ff; }
    .data-circulo { width: 44px; height: 44px; border-radius: 50%; background: #f0effc; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
    .data-btn.selecionada .data-circulo { background: #7F77DD; }
    .dia-num { font-size: 18px; font-weight: 700; color: #7F77DD; line-height: 1; }
    .data-btn.selecionada .dia-num { color: white; }
    .dia-mes { font-size: 10px; font-weight: 600; color: #7F77DD; text-transform: uppercase; }
    .data-btn.selecionada .dia-mes { color: rgba(255,255,255,0.85); }
    .data-info { flex: 1; }
    .data-semana { font-size: 15px; font-weight: 500; color: #222; }
    .data-completa { font-size: 12px; color: #888; margin-top: 1px; }
    .check { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #ddd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .data-btn.selecionada .check { background: #7F77DD; border-color: #7F77DD; }
    .check-inner { width: 8px; height: 8px; border-radius: 50%; background: white; display: none; }
    .data-btn.selecionada .check-inner { display: block; }
    .btn-votar { width: 100%; padding: 13px; background: #7F77DD; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.15s; margin-top: 0.5rem; }
    .btn-votar:hover:not(:disabled) { background: #6b63cc; }
    .btn-votar:disabled { opacity: 0.6; cursor: default; }
    .alerta { padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-top: 1rem; }
    .alerta-sucesso { background: #E1F5EE; color: #085041; }
    .alerta-erro { background: #FCEBEB; color: #501313; }
    .link-resultados { display: block; text-align: center; margin-top: 1.5rem; font-size: 13px; color: #7F77DD; text-decoration: none; }
    .link-resultados:hover { text-decoration: underline; }
    .loading { text-align: center; color: #888; font-size: 15px; padding: 3rem; }
    .inativa { text-align: center; padding: 2rem; color: #666; }
  `

  return (
    <>
      <Head>
        <title>{config?.titulo || 'Votação'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{estilos}</style>

      <div className="card">
        {carregando ? (
          <div className="loading">A carregar...</div>
        ) : !config ? (
          <div className="inativa">
            <p style={{ fontSize: 40 }}>🗓️</p>
            <p style={{ marginTop: '1rem', fontWeight: 500 }}>Nenhuma votação criada ainda.</p>
            <p style={{ fontSize: 13, color: '#999', marginTop: 8 }}>Acede a <a href="/admin" style={{ color: '#7F77DD' }}>/admin</a> para criar uma.</p>
          </div>
        ) : !config.ativa ? (
          <div className="inativa">
            <p>Esta votação está encerrada.</p>
            <a href="/resultados" className="link-resultados">Ver resultados →</a>
          </div>
        ) : estado === 'sucesso' ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: 56, marginBottom: '1rem' }}>✅</div>
            <h1 style={{ marginBottom: '0.5rem' }}>Voto registado!</h1>
            <p style={{ color: '#666', fontSize: 15 }}>Obrigado, <strong>{nome}</strong>. O teu voto foi guardado com sucesso.</p>
            <a href="/resultados" className="link-resultados" style={{ marginTop: '2rem', display: 'inline-block' }}>Ver resultados da votação →</a>
          </div>
        ) : (
          <>
            <h1>{config.titulo}</h1>
            {config.descricao && <p className="desc">{config.descricao}</p>}

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="nome">O teu nome</label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: Maria Silva"
                value={nome}
                onChange={e => setNome(e.target.value)}
                disabled={estado === 'enviando'}
              />
            </div>

            <label>Escolhe a data preferida</label>
            <div className="datas">
              {config.datas.map(d => {
                const f = formatarData(d)
                const sel = dataSelecionada === d
                return (
                  <button
                    key={d}
                    className={`data-btn${sel ? ' selecionada' : ''}`}
                    onClick={() => setDataSelecionada(d)}
                    disabled={estado === 'enviando'}
                  >
                    <div className="data-circulo">
                      <span className="dia-num">{f.dia}</span>
                      <span className="dia-mes">{f.mesNome}</span>
                    </div>
                    <div className="data-info">
                      <div className="data-semana">{f.diaSemana}feira</div>
                      <div className="data-completa">{f.dia} de {f.mesNome} de {f.ano}</div>
                    </div>
                    <div className="check">
                      <div className="check-inner" />
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              className="btn-votar"
              onClick={votar}
              disabled={!nome.trim() || !dataSelecionada || estado === 'enviando'}
            >
              {estado === 'enviando' ? 'A votar...' : 'Confirmar voto'}
            </button>

            {estado === 'erro' && (
              <div className="alerta alerta-erro">{mensagem}</div>
            )}

            <a href="/resultados" className="link-resultados">Ver resultados →</a>
          </>
        )}
      </div>
    </>
  )
}
