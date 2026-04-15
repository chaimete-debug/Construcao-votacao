import { useState } from 'react'
import Head from 'next/head'

interface DataComHorarios {
  data: string
  horas: string[]
}

export default function Admin() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [senha, setSenha] = useState('')
  const [datas, setDatas] = useState<DataComHorarios[]>([
    { data: '', horas: [''] },
    { data: '', horas: [''] },
  ])
  const [locais, setLocais] = useState([''])
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'sucesso' | 'erro'>('idle')
  const [mensagem, setMensagem] = useState('')

  function adicionarData() {
    setDatas([...datas, { data: '', horas: [''] }])
  }

  function removerData(i: number) {
    setDatas(datas.filter((_, idx) => idx !== i))
  }

  function atualizarData(i: number, val: string) {
    const n = [...datas]
    n[i] = { ...n[i], data: val }
    setDatas(n)
  }

  function adicionarHora(dataIdx: number) {
    const n = [...datas]
    n[dataIdx] = { ...n[dataIdx], horas: [...n[dataIdx].horas, ''] }
    setDatas(n)
  }

  function removerHora(dataIdx: number, horaIdx: number) {
    const n = [...datas]
    n[dataIdx] = { ...n[dataIdx], horas: n[dataIdx].horas.filter((_, idx) => idx !== horaIdx) }
    setDatas(n)
  }

  function atualizarHora(dataIdx: number, horaIdx: number, val: string) {
    const n = [...datas]
    const horas = [...n[dataIdx].horas]
    horas[horaIdx] = val
    n[dataIdx] = { ...n[dataIdx], horas }
    setDatas(n)
  }

  function adicionarLocal() { setLocais([...locais, '']) }
  function removerLocal(i: number) { setLocais(locais.filter((_, idx) => idx !== i)) }
  function atualizarLocal(i: number, val: string) { const n = [...locais]; n[i] = val; setLocais(n) }

  async function criar() {
    const datasValidas = datas
      .filter(d => d.data.trim() !== '')
      .map(d => ({ data: d.data, horas: d.horas.filter(h => h.trim() !== '') }))
    const locaisValidos = locais.filter(l => l.trim() !== '')

    if (!titulo.trim() || datasValidas.length < 2 || !senha) {
      setEstado('erro')
      setMensagem('Preenche o título, a senha e pelo menos 2 datas.')
      return
    }

    setEstado('enviando')
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descricao, datas: datasValidas, locais: locaisValidos, senha }),
    })
    const data = await res.json()
    if (data.ok) {
      setEstado('sucesso')
      setMensagem('Votação criada com sucesso! Partilha o link abaixo.')
    } else {
      setEstado('erro')
      setMensagem(data.erro || 'Erro ao criar votação.')
    }
  }

  const estilos = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f0; min-height: 100vh; padding: 2rem 1rem; }
    .container { max-width: 520px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 600; color: #111; margin-bottom: 0.25rem; }
    .subtitulo { font-size: 14px; color: #888; margin-bottom: 2rem; }
    .card { background: white; border-radius: 14px; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.07); }
    .campo { margin-bottom: 1.25rem; }
    label { display: block; font-size: 13px; font-weight: 500; color: #444; margin-bottom: 6px; }
    input[type=text], input[type=password], input[type=date], input[type=time], textarea { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; outline: none; font-family: inherit; transition: border 0.15s; }
    input:focus, textarea:focus { border-color: #7F77DD; box-shadow: 0 0 0 3px rgba(127,119,221,0.15); }
    textarea { resize: vertical; min-height: 72px; }
    .data-bloco { background: #fafafa; border: 1px solid #efefef; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
    .data-bloco-header { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
    .data-bloco-header input { flex: 1; }
    .horas-section { padding-left: 8px; border-left: 2px solid #e5e5e5; margin-top: 8px; }
    .horas-label { font-size: 12px; color: #888; margin-bottom: 6px; }
    .row { display: flex; gap: 8px; margin-bottom: 6px; align-items: center; }
    .row input { flex: 1; }
    .btn-remover { background: none; border: 1px solid #ddd; border-radius: 6px; width: 32px; height: 36px; cursor: pointer; color: #999; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .btn-remover:hover { background: #fff0f0; border-color: #f5c0c0; color: #c00; }
    .btn-add-hora { background: none; border: 1px dashed #ccc; border-radius: 6px; padding: 5px 10px; font-size: 12px; color: #888; cursor: pointer; margin-top: 2px; }
    .btn-add-hora:hover { background: #f8f8f8; }
    .btn-add { background: none; border: 1px dashed #ccc; border-radius: 8px; padding: 8px 14px; font-size: 13px; color: #888; cursor: pointer; width: 100%; margin-top: 4px; }
    .btn-add:hover { background: #f8f8f8; }
    .btn-criar { width: 100%; padding: 13px; background: #7F77DD; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 1.5rem; transition: background 0.15s; }
    .btn-criar:hover:not(:disabled) { background: #6b63cc; }
    .btn-criar:disabled { opacity: 0.6; cursor: default; }
    .alerta { padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-top: 1rem; }
    .alerta-sucesso { background: #E1F5EE; color: #085041; }
    .alerta-erro { background: #FCEBEB; color: #501313; }
    .link-box { background: #f8f7ff; border: 1px solid #d4d1f5; border-radius: 8px; padding: 12px 16px; margin-top: 1rem; word-break: break-all; font-size: 14px; color: #534AB7; font-family: monospace; }
    .divider { border: none; border-top: 1px solid #f0f0f0; margin: 1.5rem 0; }
    .hint { font-size: 12px; color: #999; margin-top: 4px; }
    .opcional { font-size: 11px; color: #aaa; font-weight: 400; margin-left: 4px; }
  `

  return (
    <>
      <Head>
        <title>Admin — Criar votação</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{estilos}</style>

      <div className="container">
        <h1>Criar votação</h1>
        <p className="subtitulo">Configura a votação e partilha o link com o grupo</p>

        <div className="card">
          <div className="campo">
            <label>Título da reunião</label>
            <input type="text" placeholder="Ex: Reunião mensal do grupo" value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>

          <div className="campo">
            <label>Descrição <span className="opcional">(opcional)</span></label>
            <textarea placeholder="Ex: Vamos votar o melhor dia para a nossa próxima reunião." value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>

          <hr className="divider" />

          <div className="campo">
            <label>Datas e horários <span className="opcional">(mínimo 2 datas)</span></label>
            {datas.map((d, dataIdx) => (
              <div className="data-bloco" key={dataIdx}>
                <div className="data-bloco-header">
                  <input
                    type="date"
                    value={d.data}
                    onChange={e => atualizarData(dataIdx, e.target.value)}
                  />
                  {datas.length > 2 && (
                    <button className="btn-remover" onClick={() => removerData(dataIdx)}>×</button>
                  )}
                </div>

                <div className="horas-section">
                  <div className="horas-label">Horários para este dia <span className="opcional">(opcional)</span></div>
                  {d.horas.map((h, horaIdx) => (
                    <div className="row" key={horaIdx}>
                      <input
                        type="time"
                        value={h}
                        onChange={e => atualizarHora(dataIdx, horaIdx, e.target.value)}
                      />
                      {d.horas.length > 1 && (
                        <button className="btn-remover" onClick={() => removerHora(dataIdx, horaIdx)}>×</button>
                      )}
                    </div>
                  ))}
                  <button className="btn-add-hora" onClick={() => adicionarHora(dataIdx)}>
                    + horário
                  </button>
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={adicionarData}>+ Adicionar outra data</button>
          </div>

          <div className="campo">
            <label>Locais <span className="opcional">(opcional)</span></label>
            {locais.map((l, i) => (
              <div className="row" key={i}>
                <input type="text" placeholder="Ex: Sala de reuniões A, Casa do João..." value={l} onChange={e => atualizarLocal(i, e.target.value)} />
                {locais.length > 1 && <button className="btn-remover" onClick={() => removerLocal(i)}>×</button>}
              </div>
            ))}
            <button className="btn-add" onClick={adicionarLocal}>+ Adicionar outro local</button>
            <p className="hint">Se não adicionares locais, a votação será só por datas e horários.</p>
          </div>

          <hr className="divider" />

          <div className="campo">
            <label>Senha de administrador</label>
            <input type="password" placeholder="Deve ser igual à variável ADMIN_SENHA no Vercel" value={senha} onChange={e => setSenha(e.target.value)} />
          </div>

          <button className="btn-criar" onClick={criar} disabled={estado === 'enviando'}>
            {estado === 'enviando' ? 'A criar...' : 'Criar votação'}
          </button>

          {estado === 'erro' && <div className="alerta alerta-erro">{mensagem}</div>}

          {estado === 'sucesso' && (
            <>
              <div className="alerta alerta-sucesso">{mensagem}</div>
              <div className="link-box">
                🔗 Link de votação:<br />
                <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/</strong>
              </div>
              <div className="link-box" style={{ marginTop: 8 }}>
                📊 Resultados:<br />
                <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/resultados</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
