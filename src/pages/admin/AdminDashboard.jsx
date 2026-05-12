import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, Gavel, Plus, Edit, Trash2, ShieldCheck, ShieldOff, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuction } from '../../context/AuctionContext';
import { formatRupiah, categoryLabel } from '../../lib/utils';
import api from '../../lib/api';

export default function AdminDashboard() {
  const { currentUser, users, updateUser } = useAuth();
  const { cars, auctions, setCars } = useAuction();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState({ brand:'', model:'', category:'penumpang', chassis_number:'', engine_number:'', starting_price:'', image_url:'', description:'' });
  const [msg, setMsg] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="page"><div className="empty-state"><div className="empty-state-icon">🔒</div><h3>Akses Admin Diperlukan</h3><button className="btn btn-primary" onClick={()=>navigate('/')}>Kembali</button></div></div>;
  }

  const activeAuctions = auctions.filter(a => a.status === 'active').length;
  const verifiedUsers = users.filter(u => u.is_verified !== false && u.role !== 'admin').length;

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/cars', {
        ...newCar,
        starting_price: parseInt(newCar.starting_price)
      });
      if (res.data?.data) {
        setCars(prev => [...prev, res.data.data]);
        setShowAddCar(false);
        setNewCar({ brand:'', model:'', category:'penumpang', chassis_number:'', engine_number:'', starting_price:'', image_url:'', description:'' });
        setMsg('Kendaraan berhasil ditambahkan!');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert('Gagal menambah kendaraan');
    }
  };

  const deleteCar = async (id) => { 
    if (window.confirm('Hapus kendaraan ini?')) {
      try {
        await api.delete(`/cars/${id}`);
        setCars(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert('Gagal menghapus kendaraan');
      }
    }
  };

  const toggleVerify = (user) => { updateUser({ ...user, is_verified: !user.is_verified }); };
  const toggleSuspend = (user) => { updateUser({ ...user, is_suspended: !user.is_suspended }); };

  return (
    <div className="page">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">👑 Dashboard Admin</h1>
          <p className="page-sub">Kelola sistem CarVentory</p>
        </div>
        {msg && <div className="alert alert-success" style={{ marginBottom:0 }}>✓ {msg}</div>}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Kendaraan', value: cars.length, color:'var(--orange)', icon:'🚗' },
          { label: 'Lelang Aktif', value: activeAuctions, color:'var(--success)', icon:'🔴' },
          { label: 'User Terverifikasi', value: verifiedUsers, color:'var(--info)', icon:'✅' },
          { label: 'Total Pengguna', value: users.filter(u=>u.role!=='admin').length, color:'var(--warning)', icon:'👥' },
        ].map(({ label, value, color, icon }) => (
          <div className="stat-card" key={label}>
            <div style={{ fontSize:28 }}>{icon}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[['overview','📊 Overview'],['cars','🚗 Kendaraan'],['users','👥 Pengguna'],['auctions','🔨 Lelang']].map(([id,label]) => (
          <div key={id} className={`admin-tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{label}</div>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
              <h3 style={{ fontWeight:700, marginBottom:16 }}>Kendaraan Terbaru</h3>
              {cars.slice(-4).reverse().map(car => (
                <div key={car.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <img src={car.image_url} alt="" style={{ width:44, height:34, borderRadius:6, objectFit:'cover' }} onError={e=>{e.target.style.display='none'}} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>{car.model ? `${car.brand} ${car.model}` : car.name}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{formatRupiah(car.starting_price || car.initial_price)}</div>
                  </div>
                  <span className={`badge cat-${car.category}`}>{categoryLabel[car.category] || car.category}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:20 }}>
              <h3 style={{ fontWeight:700, marginBottom:16 }}>Status Lelang</h3>
              {[['Aktif', auctions.filter(a=>a.status==='active').length, 'var(--success)'],
                ['Segera', auctions.filter(a=>a.status==='upcoming').length, 'var(--info)'],
                ['Selesai', auctions.filter(a=>a.status==='ended').length, 'var(--text3)']
              ].map(([label, count, color]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--text2)', fontWeight:500 }}>{label}</span>
                  <span style={{ fontWeight:800, color }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cars */}
      {tab === 'cars' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <button className="btn btn-primary" onClick={()=>setShowAddCar(true)}><Plus size={15}/> Tambah Kendaraan</button>
          </div>

          {showAddCar && (
            <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowAddCar(false)}}>
              <div className="modal">
                <div className="modal-header"><span className="modal-title">Tambah Kendaraan</span><button onClick={()=>setShowAddCar(false)} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:20 }}>×</button></div>
                <form onSubmit={handleAddCar}>
                  <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[['brand','Brand Kendaraan','text',true], ['model','Model Kendaraan','text',true],['chassis_number','No. Rangka','text',true],['engine_number','No. Mesin','text',true],['starting_price','Harga Awal (Rp)','number',true],['image_url','URL Gambar','url',false],['description','Deskripsi','text',false]].map(([k,label,type,req]) => (
                      <div key={k}>
                        <label className="input-label">{label}</label>
                        {k==='description'
                          ? <textarea className="input" style={{height:72,resize:'vertical'}} value={newCar[k]} onChange={e=>setNewCar(p=>({...p,[k]:e.target.value}))} />
                          : <input className="input" type={type} value={newCar[k]} onChange={e=>setNewCar(p=>({...p,[k]:e.target.value}))} required={req} />}
                      </div>
                    ))}
                    <div>
                      <label className="input-label">Kategori</label>
                      <select className="input" value={newCar.category} onChange={e=>setNewCar(p=>({...p,category:e.target.value}))}>
                        <option value="penumpang">Penumpang</option>
                        <option value="mewah">Mewah</option>
                        <option value="klasik">Klasik</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-ghost" onClick={()=>setShowAddCar(false)}>Batal</button>
                    <button type="submit" className="btn btn-primary">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead><tr><th>Kendaraan</th><th>Kategori</th><th>Harga Awal</th><th>No. Rangka</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id}>
                    <td>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <img src={car.image_url} alt="" style={{ width:44, height:34, borderRadius:6, objectFit:'cover' }} onError={e=>{e.target.style.display='none'}} />
                        <span style={{ fontWeight:600, fontSize:13 }}>{car.model ? `${car.brand} ${car.model}` : car.name}</span>
                      </div>
                    </td>
                    <td><span className={`badge cat-${car.category}`}>{categoryLabel[car.category] || car.category}</span></td>
                    <td style={{ fontWeight:700, color:'var(--orange)' }}>{formatRupiah(car.starting_price || car.initial_price)}</td>
                    <td style={{ fontFamily:'monospace', fontSize:11 }}>{car.chassis_number || '-'}</td>
                    <td>{car.is_verified !== false ? <span className="badge badge-success">Terverifikasi</span> : <span className="badge badge-warning">Belum</span>}</td>
                    <td>
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-ghost btn-sm" title="Edit"><Edit size={13}/></button>
                        <button className="btn btn-danger btn-sm" title="Hapus" onClick={()=>deleteCar(car.id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pengguna</th><th>Email</th><th>Nomor HP</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {users.filter(u=>u.role!=='admin').map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight:600 }}>{u.username || u.name}</td>
                  <td style={{ color:'var(--text3)', fontSize:13 }}>{u.email}</td>
                  <td style={{ fontSize:12 }}>{u.phone || '-'}</td>
                  <td>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {u.is_verified !== false ? <span className="badge badge-success">Terverifikasi</span> : <span className="badge badge-warning">Belum Verifikasi</span>}
                      {u.is_suspended && <span className="badge badge-danger">Ditangguhkan</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className={`btn btn-sm ${u.is_verified !== false ?'btn-ghost':'btn-success'}`} onClick={()=>toggleVerify(u)}>
                        {u.is_verified !== false ? <><ShieldOff size={12}/> Batal</> : <><ShieldCheck size={12}/> Verifikasi</>}
                      </button>
                      <button className={`btn btn-sm ${u.is_suspended?'btn-ghost':'btn-danger'}`} onClick={()=>toggleSuspend(u)}>
                        <Ban size={12}/> {u.is_suspended?'Aktifkan':'Tangguhkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Auctions */}
      {tab === 'auctions' && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Kendaraan</th><th>Penawaran Tertinggi</th><th>Status</th><th>Berakhir</th></tr></thead>
            <tbody>
              {auctions.map(auc => {
                const car = cars.find(c=>String(c.id)===String(auc.car_id));
                const carName = car ? (car.model ? `${car.brand} ${car.model}` : car.name) : '-';
                return (
                  <tr key={auc.id}>
                    <td style={{ fontWeight:600 }}>{carName}</td>
                    <td style={{ color:'var(--orange)', fontWeight:700 }}>{formatRupiah(auc.current_highest_bid)}</td>
                    <td>
                      {auc.status==='active' && <span className="badge badge-success">Aktif</span>}
                      {auc.status==='upcoming' && <span className="badge badge-info">Segera</span>}
                      {auc.status==='ended' && <span className="badge badge-gray">Selesai</span>}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text3)' }}>{new Date(auc.end_time).toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
