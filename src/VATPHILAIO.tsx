import { useEffect, useState, useRef } from 'react';
import logo from './assets/VATPHILLOGO.png';
import LL1 from './assets/cuecards/RPLL/LL1.png';
import LL2 from './assets/cuecards/RPLL/LL2.png';
import LL3 from './assets/cuecards/RPLL/LL3.png';
import LL4 from './assets/cuecards/RPLL/LL4.png';
import LL5 from './assets/cuecards/RPLL/LL5.png';
import MNL1 from './assets/cuecards/RPHI/MNL1.png';
import MNL2 from './assets/cuecards/RPHI/MNL2.png';

type TabType = 'metar' | 'radar' | 'cuecards';

const AIRPORTS: Record<string, string> = {
  RPLL: 'Ninoy Aquino International Airport',
  RP: 'All Airports Philippines',
  RPL: 'Luzon All Airports',
  RPV: 'Visayas All Airports',
  RPM: 'Mindinao All Airports',
  RPVM: 'Mactan International Airport',
  RPVP: 'Puerto Princesa International Airport',
  RPLB: 'Subic Bay International Airport',
  RPMD: 'Francisco Bangoy International Airport',
  RPLI: 'Laoag International Airport',
  RPVK: 'Kalibo International Airport',
  RPMZ: 'Zamboanga International Airport',
  RPVD: 'Dumaguete Airport',
  RPLC: 'Clark International Airport',
  RPMR: 'General Santos International Airport',
};

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

type CueCard = {
  id: number;
  name: string;
  image: string;
  pos: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
};

type Controller = {
  cid: number;
  callsign: string;
  name: string;
  frequency?: string;
  facility?: string;
};

function VATPHILATC() {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [dragPos, setDragPos] = useState({ x: window.innerWidth - 240, y: window.innerHeight / 2 - 150 });
  const [zIndex, setZIndex] = useState(300);

  useEffect(() => {
    const fetchControllers = async () => {
      try {
        const res = await fetch('https://data.vatsim.net/v3/vatsim-data.json');
        const data = await res.json();
        if (!data.controllers) return setControllers([]);
        const allControllers: Controller[] = Object.values(data.controllers)
          .map((c: any) => ({
            cid: c.cid,
            callsign: c.callsign,
            frequency: c.frequency,
            name: c.name,
            facility: c.facility,
          }))
          .filter((c: Controller) => c.callsign && (c.callsign.startsWith('RP') || c.callsign.startsWith('MNL')));
        setControllers(allControllers);
      } catch (err) {
        console.error(err);
        setControllers([]);
      }
    };

    fetchControllers();
    const interval = setInterval(fetchControllers, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDrag = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...dragPos };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const x = startPos.x + moveEvent.clientX - startX;
      const y = startPos.y + moveEvent.clientY - startY;
      setDragPos({ x, y });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const bringToFront = () => setZIndex(prev => prev + 1);

  return (
    <div
      style={{
        position: 'absolute',
        top: dragPos.y,
        left: dragPos.x,
        width: 220,
        maxHeight: '60%',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.75rem',
        fontFamily: 'monospace',
        zIndex,
        overflowY: 'auto',
        cursor: 'grab',
      }}
      onMouseDown={handleDrag}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
        Active ATC
      </div>
      {controllers.length === 0 ? (
        <div style={{ textAlign: 'center', fontStyle: 'italic' }}>No controllers online</div>
      ) : (
        controllers.map(c => (
          <div
            key={c.cid}
            style={{
              padding: '0.25rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{c.callsign}</div>
            <div style={{ fontSize: '0.85rem' }}>{c.name}</div>
            {c.frequency && <div style={{ fontSize: '0.85rem' }}>{c.frequency} MHz</div>}
          </div>
        ))
      )}
    </div>
  );
}

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
// Main component
export default function VATPHILAIO() {
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
  const [infoBoxVisible, setInfoBoxVisible] = useState(true); // info box
  const [activeTab, setActiveTab] = useState<TabType>('metar');
  const [selectedAirport, setSelectedAirport] = useState<'RPLL' | 'RPVM' | 'RPHI'>('RPLL');
  const [cueCards, setCueCards] = useState<CueCard[]>([]);
  const cueCardId = useRef(1);
  const maxZIndex = useRef(200);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showATC, setShowATC] = useState(true);
  const initialized = useRef(false);
  const closeInfoBox = () => setInfoBoxVisible(false);
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Update fullscreen state
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Fetch METARs
  const fetchMetar = async (icao: string, box: Box) => {
    setBoxes(prev => prev.map(b => (b.id === box.id ? { ...b, fetching: true } : b)));
    try {
      const apiBase = import.meta.env.VITE_API_PROXY;
      const res = await fetch(`${apiBase}/${icao}`);
      const data = await res.json();
      const metarText = typeof data === 'string' ? data : data.raw || '';
      const parsed = parseMetar(metarText || '');
      parsed.raw = metarText || 'No METAR';

      setBoxes(prev =>
        prev.map(b =>
          b.id === box.id
            ? {
                ...b,
                metar: parsed,
                newMetar: Boolean(b.lastRaw && b.lastRaw !== metarText),
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

  // Initial fetch on mount - only run once
  useEffect(() => {
    if (!initialized.current) {
      boxes.forEach(box => fetchMetar(box.icao, box));
      initialized.current = true;
    }

    const fetchInterval = setInterval(() => {
      boxes.forEach(box => fetchMetar(box.icao, box));
    }, 300000); // 5 mins

    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(timeInterval);
    };
  }, []); // Empty dependency array to run only once

  // Drag & resize handlers for boxes
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
      setBoxes(prev => prev.map(b => (b.id === id ? { ...b, dragPos: { x, y } } : b)));
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
      setBoxes(prev => prev.map(b => (b.id === id ? { ...b, size: { width: newWidth, height: newHeight } } : b)));
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
          left: 10,
          padding: '0.25rem 0.5rem',
          background: 'rgb(38,40,41)',
          color: 'white',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          zIndex: 5,
        }}
      >
        Zulu: {zulu} | PH: {phTime}
      </div>
    );
  };

  const removeBox = (id: number) => setBoxes(prev => prev.filter(b => b.id !== id));

  const CUE_CARDS_DATA: Record<'RPLL' | 'RPVM' | 'RPHI', Array<{ name: string; image: string }>> = {
    RPLL: [
      { name: 'Delivery', image: LL1 },
      { name: 'VFR', image: LL2 },
      { name: 'Go Around Procedures', image: LL3 },
      { name: 'Frequencies', image: LL4 },
      { name: 'Heli Chart', image: LL5 },
    ],
    RPHI: [
      { name: 'Waypoint Restrictions', image: MNL1 },
      { name: 'Sectors', image: MNL2 },
    ],
    RPVM: [
      { name: 'To be added', image: 'https://via.placeholder.com/600x400/4CAF50/white?text=RPVM+Airport+Diagram' },
    ],
  };

  const addCueCard = (name: string, image: string) => {
    maxZIndex.current += 1;
    const newCard: CueCard = {
      id: cueCardId.current++,
      name,
      image,
      pos: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 },
      size: { width: 600, height: 400 },
      zIndex: maxZIndex.current,
    };
    setCueCards(prev => [...prev, newCard]);
  };

  const bringCueToFront = (id: number) => {
    maxZIndex.current += 1;
    setCueCards(prev => prev.map(c => (c.id === id ? { ...c, zIndex: maxZIndex.current } : c)));
  };

  const handleCueCardDrag = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    bringCueToFront(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const card = cueCards.find(c => c.id === id);
    if (!card) return;
    const offsetX = startX - card.pos.x;
    const offsetY = startY - card.pos.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.clientX - offsetX;
      const y = moveEvent.clientY - offsetY;
      setCueCards(prev => prev.map(c => (c.id === id ? { ...c, pos: { x, y } } : c)));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleCueCardResize = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    bringCueToFront(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const card = cueCards.find(c => c.id === id);
    if (!card) return;
    const startWidth = card.size.width;
    const startHeight = card.size.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
      setCueCards(prev => prev.map(c => (c.id === id ? { ...c, size: { width: newWidth, height: newHeight } } : c)));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

 const removeCueCard = (id: number) => setCueCards(prev => prev.filter(c => c.id !== id));

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
      {infoBoxVisible && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      zIndex: 9999,
      fontFamily: 'monospace',
      textAlign: 'center',
      padding: '2rem',
    }}
  >
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to VATPHIL AIO!</h1>
    <p style={{ marginBottom: '2rem' }}>
      Important updates to sector files will be shown here. Current AIRAC2510
      - Windy Satellite is currently down
    </p>
    <button
      onClick={closeInfoBox}
      style={{
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        background: '#4CAF50',
        color: 'white',
      }}
    >
      Continue
    </button>
  </div>
)}
      {/* Background Logo */}
      {activeTab !== 'radar' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        >
          <img src={logo} alt="VATPHIL Logo" width={400} style={{ marginBottom: '1rem' }} />
          <div
            style={{
              position: 'fixed',
              top: 300,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              opacity: 1,
            }}
          >
            VATPHIL All In One - v0.5.5
          </div>
        </div>
      )}

      {renderTime()}

      {/* Settings & Fullscreen */}
      {activeTab !== 'radar' && (
        <>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'transparent',
              color: 'white',
              border: '1px solid white',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            {isFullscreen ? '⤢' : '⤡'}
          </button>

          <button
            onClick={() => setShowSettings((prev) => !prev)}
            title="Settings"
            style={{
              position: 'absolute',
              top: 60,
              right: 10,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: showSettings ? 'white' : 'transparent',
              color: showSettings ? 'black' : 'white',
              border: '1px solid white',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            ⚙️
          </button>

          {showSettings && (
            <div
              style={{
                position: 'absolute',
                top: 110,
                right: 10,
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0.75rem',
                color: 'white',
                padding: '1rem',
                width: 220,
                fontFamily: 'monospace',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  textAlign: 'center',
                }}
              >
                ⚙️ Settings
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span>Show Live ATC</span>
                <input
                  type="checkbox"
                  checked={showATC}
                  onChange={(e) => setShowATC(e.target.checked)}
                />
              </label>

              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  opacity: 0.6,
                }}
              >
                More settings coming soon...
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab Bar */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '0.75rem',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setActiveTab('metar')}
          style={{
            background: activeTab === 'metar' ? 'white' : 'transparent',
            color: activeTab === 'metar' ? 'black' : 'white',
            border: '1px solid white',
            borderRadius: '0.5rem',
            padding: '0.25rem 1rem',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          data-testid="tab-metar"
        >
          METAR
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          style={{
            background: activeTab === 'radar' ? 'white' : 'transparent',
            color: activeTab === 'radar' ? 'black' : 'white',
            border: '1px solid white',
            borderRadius: '0.5rem',
            padding: '0.25rem 1rem',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          data-testid="tab-radar"
        >
          RADAR
        </button>

        <button
          onClick={() => setActiveTab('cuecards')}
          style={{
            background: activeTab === 'cuecards' ? 'white' : 'transparent',
            color: activeTab === 'cuecards' ? 'black' : 'white',
            border: '1px solid white',
            borderRadius: '0.5rem',
            padding: '0.25rem 1rem',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          data-testid="tab-cuecards"
        >
          CUE CARDS
        </button>
      </div>

      {/* METAR Boxes */}
      {activeTab === 'metar' &&
        boxes.map(box => (
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
              zIndex: 100,
            }}
            onMouseDown={e => handleDrag(e, box.id)}
            onClick={() =>
              setBoxes(prev => prev.map(b => (b.id === box.id ? { ...b, newMetar: false } : b)))
            }
            data-testid={`box-metar-${box.id}`}
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
                data-testid={`input-icao-${box.id}`}
              />
              <button
                onClick={() => fetchMetar(box.icao, box)}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                data-testid={`button-fetch-${box.id}`}
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
                data-testid={`button-remove-${box.id}`}
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
              {box.fetching && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    width: 24,
                    height: 24,
                    border: '3px solid #ccc',
                    borderTop: '3px solid #333',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    alignSelf: 'center',
                  }}
                ></div>
              )}
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
              data-testid={`handle-resize-${box.id}`}
            ></div>
          </div>
        ))}

      {/* Add / Clear Buttons — only on METAR tab */}
      {activeTab === 'metar' && (
        <>
          <button
            onClick={addBox}
            title="Add METAR"
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
              zIndex: 10,
            }}
            data-testid="button-add-metar"
          >
            +
          </button>

          {boxes.length > 0 && (
            <button
              onClick={clearBoxes}
              title="Remove All"
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
                zIndex: 10,
              }}
              data-testid="button-clear-all"
            >
              -
            </button>
          )}
        </>
      )}

      {/* Radar iframe */}
      <iframe
        title="Philippines Weather Radar"
        src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=kt&zoom=6&overlay=wind&product=ecmwf&level=surface&lat=11.987&lon=122.165&pressure=true&message=true"
        width="100%"
        height="100%"
        style={{ 
          border: 'none',
          display: activeTab === 'radar' ? 'block' : 'none'
        }}
        allowFullScreen
      ></iframe>

      {/* Cue Cards Tab */}
      {activeTab === 'cuecards' && (
        <>
          {/* Control Panel */}
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: 20,
              background: 'white',
              borderRadius: '1rem',
              padding: '1rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              minWidth: 250,
              zIndex: 100,
            }}
          >
            <div style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Select Airport</div>
            <select
              value={selectedAirport}
              onChange={(e) => setSelectedAirport(e.target.value as 'RPLL' | 'RPVM' | 'RPHI')}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                borderRadius: '0.5rem',
                border: '2px solid #ccc',
                fontSize: '1rem',
              }}
              data-testid="select-airport"
            >
              <option value="RPHI">RPHI - Manila Control</option>
              <option value="RPLL">RPLL - Manila</option>
              <option value="RPVM">RPVM - Mactan-Cebu</option>
            </select>

            <div style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#555' }}>
              Available Cards:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {CUE_CARDS_DATA[selectedAirport].map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => addCueCard(card.name, card.image)}
                  style={{
                    padding: '0.5rem',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                  }}
                  data-testid={`button-add-card-${idx}`}
                >
                  {card.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cue Cards Display - FIXED Z-INDEX AND IMAGE HANDLING */}
          {cueCards.map(card => (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: card.pos.x,
                top: card.pos.y,
                width: card.size.width,
                height: card.size.height,
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none',
                zIndex: card.zIndex,
              }}
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).tagName !== 'IMG') {
                  handleCueCardDrag(e, card.id);
                }
              }}
              data-testid={`card-cue-${card.id}`}
            >
              {/* Title Bar - Draggable */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(64, 65, 65, 1)',
                  color: 'white',
                  borderTopLeftRadius: '1rem',
                  borderTopRightRadius: '1rem',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'move',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseDown={(e) => handleCueCardDrag(e, card.id)}
              >
                <span>{card.name}</span>
                <button
                  onClick={() => removeCueCard(card.id)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                  data-testid={`button-remove-card-${card.id}`}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  flex: 2,
                  position: 'relative',
                  overflow: 'auto',
                  backgroundColor: '#888888',
                }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                  draggable={false}
                />
              </div>

              {/* Resize Handle */}
              <div
                onMouseDown={(e) => handleCueCardResize(e, card.id)}
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  width: 20,
                  height: 20,
                  cursor: 'nwse-resize',
                  background: '#606060ff',
                  borderRadius: '0 0 0.75rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                }}
                data-testid={`handle-resize-card-${card.id}`}
              >
                ⋰
              </div>
            </div>
          ))}
        </>
      )}

      {/* Spinner animation keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Insert VATPHIL ATC component */}
      {showATC && <VATPHILATC />}
    </div>
  );
}
