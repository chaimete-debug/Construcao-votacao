import { useState, useEffect } from 'react'
import Head from 'next/head'

interface Voto {
  nome: string
  data: string
  timestamp: string
}

interface Config {
  titulo: string
  datas: string[]
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia))
  return `${dias[d.getDay()]}, ${dia} de ${meses[Number(mes) - 1]}`
}

export default function Resultados() {
  const [votos, setVotos] = useState<Voto[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    fetch('/api/votos')
      .then(r => r.json())
      .then(d => {
        setVotos(d.votos || [])
        setConfig(d.config)
        setCarregando(false)
      })
  }

  useEffect(() => {
    carregar()
    const t = setInterval(carregar, 10000)
    return () => clearInterval(t)
  }, [])

  const contagem: Record<string, Voto[]> = {}
  if (config) {
    config.datas.forEach(d => { contagem[d] = [] })
    votos.forEach(v => {
      if (contagem[v.data]) contagem[v.data].push(v)
    })
  }

  const max = Math.max(...Object.values(contagem).map(v => v.length), 1)
  const datas = config ? Object.entries(contagem).sort((a, b) => b[1].length - a[1].length) : []

  const estilos = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f0; min-height: 100vh; padding: 1.5rem 1rem; }
    .container { max-width: 520px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 600; color: #111; margin-bottom: 0.25rem; }
    .subtitulo { font-size: 14px; color: #888; margin-bottom: 2rem; }
    .card { background: white; border-radius: 14px; padding: 1.5rem; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); }
    .data-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .data-nome { font-size: 15px; font-weight: 500; color: #222; }
    .data-nome.vencedor { color: #7F77DD; }
    .contagem { font-size: 13px; color: #888; }
    .barra-bg { background: #f0f0f0; border-radius: 6px; height: 8px; overflow: hidden; margin-bottom: 10px; }
    .barra { height: 100%; background: #c5c2ef; border-radius: 6px; transition: width 0.5s ease; }
    .barra.vencedor { background: #7F77DD; }
    .votantes { display: flex; flex-wrap: wrap; gap: 6px; }
    .votante { background: #f5f5f5; border-radius: 20px; padding: 4px 10px; font-size: 12px; color: #555; }
    .vencedor-badge { display: inline-block; background: #f0effc; color: #534AB7; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
    .total { background: white; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.07); display: flex; gap: 2rem; }
    .stat-num { font-size: 28px; font-weight: 700; color: #7F77DD; }
    .stat-label { font-size: 12px; color: #888; margin-top: 2px; }
    .btn-atualizar { background: none; border: 1px solid #ddd; border-radius: 8px; padding: 8px 16px; font-size: 13px; color: #666; cursor: pointer; margin-bottom: 1.5rem; }
    .btn-atualizar:hover { background: #f5f5f5; }
    .link-votar { display: block; text-align: center; margin-top: 1.5rem; font-size: 14px; color: #7F77DD; text-decoration: none; }
    .loading { text-align: center; color: #888; padding: 4rem; }
  `

  return (
    <>
      <Head>
        <title>Resultados — {config?.titulo || 'Votação'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{estilos}</style>

      <div className="container">
        {carregando ? (
          <div className="loading">A carregar...</div>
        ) : (
          <>
            <h1>{config?.titulo}</h1>
            <p className="subtitulo">Resultados da votação • atualiza a cada 10s</p>

            <div className="total">
              <div>
                <div className="stat-num">{votos.length}</div>
                <div className="stat-label">votos registados</div>
              </div>
              <div>
                <div className="stat-num">{config?.datas.length || 0}</div>
                <div className="stat-label">datas em votação</div>
              </div>
            </div>

            <button className="btn-atualizar" onClick={carregar}>↻ Atualizar agora</button>

            {datas.map(([data, votantes]) => {
              const eVencedor = votantes.length === max && votantes.length > 0
              const pct = max > 0 ? (votantes.length / max) * 100 : 0
              return (
                <div className="card" key={data}>
                  <div className="data-header">
                    <span className={`data-nome${eVencedor ? ' vencedor' : ''}`}>
                      {formatarData(data)}
                      {eVencedor && <span className="vencedor-badge">★ A ganhar</span>}
                    </span>
                    <span className="contagem">{votantes.length} {votantes.length === 1 ? 'voto' : 'votos'}</span>
                  </div>
                  <div className="barra-bg">
                    <div className={`barra${eVencedor ? ' vencedor' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="votantes">
                    {votantes.length === 0
                      ? <span style={{ fontSize: 12, color: '#bbb' }}>Nenhum voto ainda</span>
                      : votantes.map(v => <span className="votante" key={v.nome}>{v.nome}</span>)
                    }
                  </div>
                </div>
              )
            })}

            <a href="/" className="link-votar">← Voltar para votar</a>
          </>
        )}
      </div>
    </>
  )
}
