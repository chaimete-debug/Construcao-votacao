import { useState, useEffect } from 'react'
import Head from 'next/head'

interface DataComHorarios {
  data: string
  horas: string[]
}

interface Voto {
  nome: string
  data: string
  hora: string
  local: string
  timestamp: string
}

interface Config {
  titulo: string
  datas: DataComHorarios[]
  locais: string[]
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
    fetch('/api/votos').then(r => r.json()).then(d => {
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

  const estilos = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f0; min-height: 100vh; padding: 1.5rem 1rem; }
    .container { max-width: 520px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 600; color: #111; margin-bottom: 0.25rem; }
    h2 { font-size: 15px; font-weight: 600; color: #555; margin: 1.5rem 0 0.75rem; }
    .subtitulo { font-size: 14px; color: #888; margin-bottom: 2rem; }
    .card { background: white; border-radius: 14px; padding: 1.5rem; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); }
    .data-titulo { font-size: 16px; font-weight: 600; color: #111; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f0f0f0; }
    .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .item-nome { font-size: 14px; font-weight: 500; color: #222; }
    .item-nome.vencedor { color: #7F77DD; }
    .contagem { font-size: 13px; color: #888; }
    .barra-bg { background: #f0f0f0; border-radius: 6px; height: 7px; overflow: hidden; margin-bottom: 8px; }
    .barra { height: 100%; background: #c5c2ef; border-radius: 6px; transition: width 0.5s ease; }
    .barra.vencedor { background: #7F77DD; }
    .votantes { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 1rem; }
    .votante { background: #f5f5f5; border-radius: 20px; padding: 3px 10px; font-size: 12px; color: #555; }
    .vencedor-badge { display: inline-block; background: #f0effc; color: #534AB7; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
    .hora-bloco { background: #fafafa; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
    .hora-bloco:last-child { margin-bottom: 0; }
    .hora-label { font-size: 13px; font-weight: 600; color: #444; margin-bottom: 6px; }
    .total { background: white; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.07); display: flex; gap: 2rem; }
    .stat-num { font-size: 28px; font-weight: 700; color: #7F77DD; }
    .stat-label { font-size: 12px; color: #888; margin-top: 2px; }
    .btn-atualizar { background: none; border: 1px solid #ddd; border-radius: 8px; padding: 8px 16px; font-size: 13px; color: #666; cursor: pointer; margin-bottom: 1.5rem; }
    .btn-atualizar:hover { background: #f5f5f5; }
    .link-votar { display: block; text-align: center; margin-top: 1.5rem; font-size: 14px; color: #7F77DD; text-decoration: none; }
    .loading { text-align: center; color: #888; padding: 4rem; }
    .sem-votos { font-size: 12px; color: #bbb; }
  `

  if (carregando) return (
    <>
      <style>{estilos}</style>
      <div className="container"><div className="loading">A carregar...</div></div>
    </>
  )

  const maxVotosPorData = config ? Math.max(...config.datas.map(d =>
    votos.filter(v => v.data === d.data).length
  ), 1) : 1

  const datasOrdenadas = config
    ? [...config.datas].sort((a, b) =>
        votos.filter(v => v.data === b.data).length - votos.filter(v => v.data === a.data).length
      )
    : []

  const contagemLocais: Record<string, Voto[]> = {}
  if (config?.locais?.length) {
    config.locais.forEach(l => { contagemLocais[l] = [] })
    votos.forEach(v => { if (v.local && contagemLocais[v.local]) contagemLocais[v.local].push(v) })
  }
  const maxLocais = Math.max(...Object.values(contagemLocais).map(v => v.length), 1)

  return (
    <>
      <Head>
        <title>Resultados — {config?.titulo || 'Votação'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{estilos}</style>

      <div className="container">
        <h1>{config?.titulo}</h1>
        <p className="subtitulo">Resultados em tempo real • atualiza a cada 10s</p>

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

        <h2>📅 Datas e horários</h2>
        {datasOrdenadas.map(({ data, horas }) => {
          const votosData = votos.filter(v => v.data === data)
          const eVencedora = votosData.length === maxVotosPorData && votosData.length > 0
          const pct = (votosData.length / maxVotosPorData) * 100

          return (
            <div className="card" key={data}>
              <div className="item-header">
                <span className={`item-nome${eVencedora ? ' vencedor' : ''}`} style={{ fontSize: 15 }}>
                  {formatarData(data)}
                  {eVencedora && <span className="vencedor-badge">★ A ganhar</span>}
                </span>
                <span className="contagem">{votosData.length} {votosData.length === 1 ? 'voto' : 'votos'}</span>
              </div>
              <div className="barra-bg">
                <div className={`barra${eVencedora ? ' vencedor' : ''}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="votantes">
                {votosData.length === 0
                  ? <span className="sem-votos">Nenhum voto ainda</span>
                  : votosData.map(v => (
                    <span className="votante" key={v.nome}>
                      {v.nome}{v.hora ? ` · ${v.hora}` : ''}
                    </span>
                  ))
                }
              </div>

              {horas.length > 0 && votosData.length > 0 && (
                <>
                  <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>Distribuição por horário:</div>
                  {horas.map(h => {
                    const votosHora = votosData.filter(v => v.hora === h)
                    const maxH = Math.max(...horas.map(hh => votosData.filter(v => v.hora === hh).length), 1)
                    const pctH = (votosHora.length / maxH) * 100
                    const eVencedoraH = votosHora.length === maxH && votosHora.length > 0
                    return (
                      <div className="hora-bloco" key={h}>
                        <div className="item-header">
                          <span className={`hora-label${eVencedoraH ? ' vencedor' : ''}`} style={{ color: eVencedoraH ? '#7F77DD' : '#444' }}>
                            🕐 {h}
                          </span>
                          <span className="contagem">{votosHora.length} {votosHora.length === 1 ? 'voto' : 'votos'}</span>
                        </div>
                        <div className="barra-bg">
                          <div className={`barra${eVencedoraH ? ' vencedor' : ''}`} style={{ width: `${pctH}%` }} />
                        </div>
                        <div className="votantes">
                          {votosHora.length === 0
                            ? <span className="sem-votos">Nenhum voto</span>
                            : votosHora.map(v => <span className="votante" key={v.nome}>{v.nome}</span>)
                          }
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )
        })}

        {Object.keys(contagemLocais).length > 0 && (
          <>
            <h2>📍 Locais</h2>
            {Object.entries(contagemLocais)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([local, votantes]) => {
                const eVencedor = votantes.length === maxLocais && votantes.length > 0
                const pct = (votantes.length / maxLocais) * 100
                return (
                  <div className="card" key={local}>
                    <div className="item-header">
                      <span className={`item-nome${eVencedor ? ' vencedor' : ''}`}>
                        {local}
                        {eVencedor && <span className="vencedor-badge">★ A ganhar</span>}
                      </span>
                      <span className="contagem">{votantes.length} {votantes.length === 1 ? 'voto' : 'votos'}</span>
                    </div>
                    <div className="barra-bg">
                      <div className={`barra${eVencedor ? ' vencedor' : ''}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="votantes">
                      {votantes.length === 0
                        ? <span className="sem-votos">Nenhum voto ainda</span>
                        : votantes.map(v => <span className="votante" key={v.nome}>{v.nome}</span>)
                      }
                    </div>
                  </div>
                )
              })}
          </>
        )}

        <a href="/" className="link-votar">← Voltar para votar</a>
      </div>
    </>
  )
}
