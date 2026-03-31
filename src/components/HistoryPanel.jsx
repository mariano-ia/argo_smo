import { useState } from 'react'

export default function HistoryPanel({ history, onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [engInput, setEngInput] = useState('')

  const saveEngagement = (id) => {
    const val = parseInt(engInput)
    if (isNaN(val)) return
    onUpdate(history.map(p => p.id === id ? { ...p, engagement: val } : p))
    setEditing(null); setEngInput('')
  }

  if (history.length === 0) return(
    <div style={{display:'flex',flexDirection:'column',textAlign:'center',padding:'32px 16px',gap:4}}>
      <span style={{fontSize:24}}>📊</span>
      <span style={{color:'#86868B',fontSize:13}}>Los posts aparecerán acá. Podés cargar engagement después de publicar.</span>
    </div>
  )

  return(
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {history.slice().reverse().map(post =>(
        <div key={post.id} style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.07)',borderRadius:12,padding:'12px 14px',gap:12}}>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:4}}>
            <div style={{fontSize:11,color:'#86868B',fontWeight:500}}>{post.date}</div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:6,background:post.platform==='instagram'?'#fce4ec':'#e3f2fd',color:post.platform==='instagram'?'#c2185b':'#1565c0'}}>{post.platform==='instagram'?'IG':'LI'}</span>
              <span style={{fontSize:11,color:'#955FB5',fontWeight:500}}>{post.pilar}</span>
            </div>
            <div style={{fontSize:12,color:'#1D1D1F',lineHeight:1.4}}>{post.headline?.replace(/\\n/g,' ').slice(0,60)}...</div>
          </div>
          <div style={{flexShrink:0,display:'flex',alignItems:'center'}}>
            {editing===post.id?(
              <div style={{display:'flex',gap:4,alignItems:'center'}}>
                <input type="number" placeholder="engagement" value={engInput} onChange={e=>setEngInput(e.target.value)} style={{fontSize:12,width:90,border:'1px solid #955FB5',borderRadius:6,padding:'4px 8px',outline:'none'}} autoFocus/>
                <button onClick={()=>saveEngagement(post.id)} style={{fontSize:12,fontWeight:700,color:'#FFFFFF',background:'#955FB5',border:'none',borderRadius:6,padding:'4px 8px',cursor:'pointer'}}>✓</button>
                <button onClick={()=>setEditing(null)} style={{fontSize:12,color:'#86868B',background:'transparent',border:'1px solid rgba(0,0,0,0.1)',borderRadius:6,padding:'4px 8px',cursor:'pointer'}}>✕</button>
              </div>
            );(
              <button onClick={()=>{setEditing(post.id);setEngInput(post.engagement||'')}} style={{fontSize:11,fontWeight:500,color:'#955FB5',background:'rgba(149,95,181,0.08)',border:'1px solid rgba(149,95,181,0.2)',borderRadius:8,padding:'4px 10px',cursor:'pointer',whiteSpace:'nowrap'}}>
                {post.engagement?`${post.engagement} eng.`:'+ engagement'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
