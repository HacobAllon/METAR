import React, { useEffect, useState, useRef } from 'react';
import logo from './assets/VATPHILLOGO.png';
type MetarData = {
  qnh_hpa?: number;
  wind_dir?: number | 'VRB';
  wind_speed?: number;
  wind_gust?: number;
  clouds?: string;
  raw?: string;
  time?: string;
};

type Box = {
  id: number;
  icao: string;
  metar?: MetarData;
  newMetar: boolean;
  dragPos: { x: number; y: number };
  size: { width: number; height: number };
  lastRaw?: string;
  fetching: boolean;
};

const AIRPORTS: Record<string, string> = {
  RPLL: 'Ninoy Aquino International Airport',
  RPVM: 'Mactan International Airport',
  RPLB: 'Subic Bay International Airport',
  RPMD: 'Francisco Bangoy International Airport',
  RPLI: 'Laog International Airport',
  RPVK: 'Kalibo International Airport',
  RPMZ: 'Zamboanga International Airport',
  RPVD: 'Dumaguete Airport',
  RPLC: 'Clark International Airport',
  RPMR: 'General Santos International Airport',
};

function parseMetar(metar: string): MetarData {
  const qnhMatch = metar.match(/Q(\d{4})/);
  const windMatch = metar.match(/(\d{3}|VRB)(\d{2,3})KT/);
  const windGustMatch = metar.match(/G(\d{2,3})KT/);
  const timeMatch = metar.match(/\d{6}Z/);
  const cloudsMatch = metar.match(/(FEW|SCT|BKN|OVC)\d{3}/g);
  return {
    qnh_hpa: qnhMatch ? Number(qnhMatch[1]) : undefined,
    wind_dir: windMatch ? (windMatch[1] === 'VRB' ? 'VRB' : Number(windMatch[1])) : undefined,
    wind_speed: windMatch ? Number(windMatch[2]) : undefined,
    wind_gust: windGustMatch ? Number(windGustMatch[1]) : undefined,
    clouds: cloudsMatch ? cloudsMatch.join(' ') : 'SKC',
    raw: metar,
    time: timeMatch ? timeMatch[0] : undefined,
  };
}

export default function VatphilMetar() {
  const [boxes, setBoxes] = useState<Box[]>([
    {
      id: 1,
      icao: 'RPLL',
      newMetar: false,
      dragPos: { x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 110 },
      size: { width: 280, height: 220 },
      lastRaw: '',
      fetching: false,
    },
  ]);
  const boxId = useRef(2);
  const [currentTime, setCurrentTime] = useState(new Date());

const fetchMetar = async (icao: string, box: Box) => {
  setBoxes(prev =>
    prev.map(b => (b.id === box.id ? { ...b, fetching: true } : b))
  );
  try {
    const apiBase = import.meta.env.VITE_API_PROXY;
    const res = await fetch(`${apiBase}/${icao}`);
    const data = await res.json();
    const metarText = typeof data === 'string' ? data : data.raw || '';
    const parsed = parseMetar(metarText);
    parsed.raw = metarText || 'No METAR';

    setBoxes(prev =>
      prev.map(b =>
        b.id === box.id
          ? {
              ...b,
              metar: parsed,
              newMetar: b.lastRaw && b.lastRaw !== metarText,
              lastRaw: metarText,
              icao,
              fetching: false,
            }
          : b
      )
    );
  } catch (err) {
    console.error(err);
    setBoxes(prev =>
      prev.map(b =>
        b.id === box.id
          ? { ...b, fetching: false, metar: { raw: 'Failed to fetch' } }
          : b
      )
    );
  }
};


  useEffect(() => {
    boxes.forEach(box => fetchMetar(box.icao, box));

    const fetchInterval = setInterval(() => {
      boxes.forEach(box => fetchMetar(box.icao, box));
    }, 1800000); // 30 minutes

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const handleDrag = (e: React.MouseEvent, id: number) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const box = boxes.find(b => b.id === id);
    if (!box) return;
    const offsetX = startX - box.dragPos.x;
    const offsetY = startY - box.dragPos.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.clientX - offsetX;
      const y = moveEvent.clientY - offsetY;
      setBoxes(prev =>
        prev.map(b => (b.id === id ? { ...b, dragPos: { x, y } } : b))
      );
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleResize = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const box = boxes.find(b => b.id === id);
    if (!box) return;
    const startWidth = box.size.width;
    const startHeight = box.size.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(240, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
      setBoxes(prev =>
        prev.map(b => (b.id === id ? { ...b, size: { width: newWidth, height: newHeight } } : b))
      );
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const getWind = (metar?: MetarData) => {
    if (!metar) return '—';
    if (!metar.wind_dir || !metar.wind_speed) return '—';
    const dir = metar.wind_dir === 'VRB' ? 'VRB' : String(metar.wind_dir).padStart(3, '0');
    if (metar.wind_dir === 'VRB') return `VRB/${metar.wind_speed}KT`;
    if (metar.wind_speed <= 2) return 'Calm';
    const gust = metar.wind_gust ? `G${metar.wind_gust}` : '';
    return `${dir}/${metar.wind_speed}${gust}KT`;
  };

  const getQNH = (metar?: MetarData) => {
    if (!metar?.qnh_hpa) return { hpa: '—', inhg: '' };
    const inhg = (metar.qnh_hpa / 33.8639).toFixed(2);
    return { hpa: `${metar.qnh_hpa} hPa`, inhg: `(${inhg} inHg)` };
  };

  const addBox = () => {
    const newBox: Box = {
      id: boxId.current++,
      icao: 'RPLL',
      newMetar: false,
      dragPos: { x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 110 },
      size: { width: 280, height: 220 },
      lastRaw: '',
      fetching: false,
    };
    setBoxes(prev => [...prev, newBox]);
    fetchMetar(newBox.icao, newBox);
  };

  const clearBoxes = () => setBoxes([]);

  const renderTime = () => {
    const zulu = currentTime.toUTCString().split(' ')[4];
    const phTime = new Date(currentTime.getTime() + 8 * 3600 * 1000)
      .toISOString()
      .substr(11, 8);
    return (
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '0.25rem 0.5rem',
          background: 'rgb(38,40,41)',
          color: 'white',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontWeight: 'bold',
        }}
      >
        Zulu: {zulu} | PH: {phTime}
      </div>
    );
  };

  const removeBox = (id: number) => setBoxes(prev => prev.filter(b => b.id !== id));

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'rgb(38,40,41)',
        overflow: 'hidden',
      }}
    >
      {renderTime()}

      {boxes.map(box => (
        <div
          key={box.id}
          style={{
            position: 'absolute',
            left: box.dragPos.x,
            top: box.dragPos.y,
            width: box.size.width,
            height: box.size.height,
            background: box.newMetar ? 'red' : 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: '0.75rem',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            cursor: 'move',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            userSelect: 'none',
            transition: 'background 0.3s',
            overflow: 'hidden',
            opacity: 1,
          }}
          onMouseDown={e => handleDrag(e, box.id)}
          onClick={() =>
            setBoxes(prev =>
              prev.map(b => (b.id === box.id ? { ...b, newMetar: false } : b))
            )
          }
        >
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={box.icao}
              maxLength={4}
              style={{
                flex: 1,
                padding: '0.25rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                borderRadius: '0.25rem',
              }}
              onChange={e =>
                setBoxes(prev =>
                  prev.map(b =>
                    b.id === box.id ? { ...b, icao: e.target.value.toUpperCase() } : b
                  )
                )
              }
              onKeyDown={e => {
                if (e.key === 'Enter') fetchMetar(box.icao, box);
              }}
            />
            <button
              onClick={() => fetchMetar(box.icao, box)}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Fetch
            </button>
            <button
              onClick={() => removeBox(box.id)}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              –
            </button>
          </div>

          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
            {box.icao} - {AIRPORTS[box.icao] || 'Unknown Airport'}
          </div>

          <div
            style={{
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {box.metar ? getQNH(box.metar).hpa : '—'}
            </div>
            <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              Wind: {getWind(box.metar)}
            </div>
            <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              Clouds: {box.metar?.clouds || 'SKC'}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.25rem' }}>
            {box.metar?.raw ? `METAR: ${box.metar.raw}` : 'METAR: N/A'}
          </div>

          <div
            onMouseDown={e => handleResize(e, box.id)}
            style={{
              position: 'absolute',
              right: 5,
              bottom: 5,
              width: 16,
              height: 16,
              cursor: 'se-resize',
              background: '#ccc',
              borderRadius: '50%',
            }}
          ></div>
        </div>
      ))}

      {/* Add + button */}
      <button
        onClick={addBox}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'transparent',
          color: 'white',
          border: '1px solid white',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'white';
          (e.currentTarget as HTMLButtonElement).style.color = 'black';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
        }}
      >
        +
      </button>

      {/* Clear all boxes button */}
      {boxes.length > 0 && (
        <button
          onClick={clearBoxes}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'transparent',
            color: 'white',
            border: '1px solid white',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'white';
            (e.currentTarget as HTMLButtonElement).style.color = 'black';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'white';
          }}
        >
          -
        </button>
      )}

      {/* logo */}
<img
  src={logo}
  alt="VATPHIL Logo"
  style={{
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    height: 60,
    opacity: 0.5, // Adjust transparency (0 = fully transparent, 1 = fully opaque)
  }}
/>
    </div>
  );
}
