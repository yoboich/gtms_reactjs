import React, {useState, useEffect, useLayoutEffect} from 'react'
import {animated, useSpring} from 'react-spring'
import { useNavigate } from 'react-router-dom'
//import { formatSI } from 'format-si-prefix'
import useSound from 'use-sound'

import tapSound from '../../audio/tap.mp3'
import config from '../../config'
import map from './img/map.png'
import friends from './img/friends.png'
import boosts from './img/boosts.png'
import clans from './img/clans.png'
import ballas from './img/ballas.png'
import gs from './img/GS.png'
import vagos from './img/Vagos.png'
import atztek from './img/Atztek.png'
import chat from './img/chat.png'
import './Main.css'

var PREFIXES = {
  '24': 'Y',
  '21': 'Z',
  '18': 'E',
  '15': 'P',
  '12': 'T',
  '9': 'B',
  '6': 'M',
  '3': 'k',
  '0': '',
  '-3': 'm',
  '-6': 'µ',
  '-9': 'n',
  '-12': 'p',
  '-15': 'f',
  '-18': 'a',
  '-21': 'z',
  '-24': 'y'
};

function formatSI(num) {
  if (num === 0) {
    return '0';
  }
  var sig = Math.abs(num); // significand
  var exponent = 0;
  while (sig >= 1000 && exponent < 24) {
    sig /= 1000;
    exponent += 3;
  }
  while (sig < 1 && exponent > -24) {
    sig *= 1000;
    exponent -= 3;
  }

  var signPrefix = num < 0 ? '-' : '';
  if (sig > 1000) {
    // exponent == 24
    // significand can be arbitrarily long
    return signPrefix + sig.toFixed(0) + PREFIXES[exponent];
  }
  return signPrefix + parseFloat(sig.toPrecision(3)) + PREFIXES[exponent];
}

const SpawnNumber = ({x, y, value}) => {
  const randomX = 50 + 50 * Math.floor(Math.random() * 3) - 1;
  const animation = useSpring({
    to: {
      transform: `translate(-${randomX}%, -400%)`,
      opacity: 0
    },
    from: {
      transform: `translate(-50%, -50%)`,
      opacity: 1
    },
    config: {
      frequency: 0.2,
      bounce: 0,
      damping: 5
    }
  });

  const spawnStyles = {
    position: "absolute",
    left: x + "px",
    top: y + "px",
    transform: `translate(-50%, -50%)`,
    color: "white",
    fontSize: "50px",
    userSelect: "none",
    zIndex: "10"
  };

  return (
    <animated.div style={Object.assign(spawnStyles, animation)} >
      {value}
    </animated.div>
  )
}

const Achievement = ({ text, img}) => {

  const [shown, setShown] = useState("opened")
  useEffect(() => {
    const tm = setTimeout(() => {
      setShown("closed")
    }, 3000)
  }, [])

  return (
    <div className={`achievement_body ${shown}`}>
      <div className='achievement_img'>
        <img src={process.env.PUBLIC_URL + `/${img}`} alt='achievement'/>
      </div>
      <div className='achievement_txt'>
        <p>{text}</p>
      </div>
    </div>
  )
}

const band_colors = {
  "Ballas": ["#7b1aff", "#610cd5"],
  "Grove Street": ["#428a46", "#357038"],
  "Grove": ["#428a46", "#357038"],
  "Vagos": ["#ffc61a", "#cc9712"],
  "Atztek": ["#f44010", "#c73623"]
}

const band_avatars = {
  "Ballas": ballas,
  "Grove Street": gs,
  "Grove": gs,
  "Vagos": vagos,
  "Atztek": atztek
}

const Main = ({ socket, score, setScore, level, band, bandScore, lastMes, setLastMes, multitap, achievements }) => {

  const [spawnNumbers, setSpawnNumbers] = useState([])
  const [circleSize, setCircleSize] = useState(1)
  const [multiplicator, setMultiplicator] = useState(1)
  
  const [levelMultitap, setLevelMultiTap] = useState(1)
  const [canClick, setCanClick] = useState(true)

  const [timeoutId, setTimeoutId] = useState(null);  

  const [playTapSound] = useSound(tapSound)

  const navigate = useNavigate()

  useLayoutEffect(() => {
    const clicksRestInterval = setTimeout(() => {
      setCircleSize(1)
      setSpawnNumbers(s => s.slice(s.length - 10))
    }, 25000)

    window.Telegram.WebApp.BackButton.hide()
    window.Telegram.WebApp.BackButton.onClick(() => {})
    socket.emit("get_main_info", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id })

    return () => {
      clearInterval(clicksRestInterval)
      window.Telegram.WebApp.BackButton.offClick(() => {})
    }
  }, [])

  

  useEffect(() => {
    if (circleSize > 1) {
      setCircleSize(circleSize - 0.01)
    }

    if (circleSize < 2) {
      setMultiplicator(1)
    }

    if ((circleSize >= 2) && (circleSize < 3)) {
      setMultiplicator(2)
    }

    if ((circleSize >= 3) && (circleSize < 4)) {
      setMultiplicator(3)
    }

    if ((circleSize >= 4) && (circleSize < 5)) {
      setMultiplicator(4)
    }

    if (circleSize >= 5) {
      setCircleSize(1)
      setCanClick(false)
      setTimeout(() => {
        setCanClick(true)
        setSpawnNumbers([])
      }, 500)
    }
  }, [circleSize])

  socket.on("sended_message", (mes) => setLastMes(mes))

  useEffect(() => {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("soft")
    playTapSound()
  }, [multiplicator])

  const onClickClick = (e) => {
      if ((canClick)) {
        if (level > 2) setLevelMultiTap(4)
        e.preventDefault();
        setScore(score + multiplicator * multitap * 1000 * levelMultitap)
        setSpawnNumbers([
          ...spawnNumbers,
          {
            x: e.clientX,
            y: e.clientY,
            tms: Date.now()
          }
        ])
        if (circleSize < 5) {
          setCircleSize(circleSize + 0.2)
        }
        if (circleSize < 2) {
          setMultiplicator(1)
        }

        if ((circleSize >= 2) && (circleSize < 3)) {
          setMultiplicator(2)
        }

        if ((circleSize >= 3) && (circleSize < 4)) {
          setMultiplicator(3)
        }

        if ((circleSize >= 4) && (circleSize < 5)) {
          setMultiplicator(4)
        }
        if (circleSize >= 5) {
          setCircleSize(1)
          setCanClick(false)
          setTimeout(() => {
            setCanClick(true)
            setSpawnNumbers([])
          }, 500)
        }

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const id = setTimeout(() => {
          socket.emit("user_click", {tgid: window.Telegram.WebApp.initDataUnsafe.user.id, add: score })
        }, 500);
    
        setTimeoutId(id);

        //socket.emit("user_click", {tgid: window.Telegram.WebApp.initDataUnsafe.user.id, add: score + multiplicator * levelMultitap * multitap})
      }

    
  }

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const onTapClick = (e) => {
    if (e.changedTouches) {
      if ((canClick) && (e.changedTouches.length > 0)) {
        if (level > 2) setLevelMultiTap(4)
        e.preventDefault();
        setScore(score + multiplicator * multitap * levelMultitap)
        setSpawnNumbers([
          ...spawnNumbers,
          {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
            tms: Date.now()
          }
        ])
        if (circleSize < 5) {
          setCircleSize(circleSize + 0.2)
        }
        if (circleSize < 2) {
          setMultiplicator(1)
        }

        if ((circleSize >= 2) && (circleSize < 3)) {
          setMultiplicator(2)
        }

        if ((circleSize >= 3) && (circleSize < 4)) {
          setMultiplicator(3)
        }

        if ((circleSize >= 4) && (circleSize < 5)) {
          setMultiplicator(4)
        }
        if (circleSize >= 5) {
          setCircleSize(1)
          setCanClick(false)
          setTimeout(() => {
            setCanClick(true)
            setSpawnNumbers([])
          }, 500)
        }

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const id = setTimeout(() => {
          socket.emit("user_click", {tgid: window.Telegram.WebApp.initDataUnsafe.user.id, add: score })
        }, 500);
    
        setTimeoutId(id);

        //socket.emit("user_click", {tgid: window.Telegram.WebApp.initDataUnsafe.user.id, add: score + multiplicator * levelMultitap * multitap})
      }

    }
  }
  

  return (
    <div style={{"--shade-color": band_colors[band][0]}} id="main_main">
      <div id="main_upper">
        <img onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); navigate("/map")}} id="main_upper_map" src={map} alt="map" />
        <div onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); navigate("/band_stats")}} id="main_upper_band" style={{"backgroundColor": band_colors[band][0]}}>
          <div id="main_upper_band_info">
            <p>{band}</p>
            <p>{formatSI(bandScore)}</p>
          </div>
          <div id="main_upper_band_avatar" style={{"backgroundColor": band_colors[band][1]}}>
            <img src={band_avatars[band]} alt="avatar" />
          </div>
        </div>
      </div>
      <div id="main_points">
        <h1>{score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</h1>
        <p>Level {level}</p>
      </div>
      <div id="main_tapable">
        <div id="main_tapable_fourth" onTouchEnd={onTapClick} >
          <div id="main_tapable_thirth">
            <div id="main_tapable_second">
              <div id="main_tapable_first">
                <div style={{"transform": `scale(${circleSize})`, backgroundColor: band_colors[band][0]}} onClick={onTapClick} className={`main_tapable_moveble x${multiplicator}`}>
                  <p>x{multiplicator}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="main_lower">
        <div id="main_lower_panel">
          <div onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); navigate("/friends")}} id="main_lower_friends">
            <img src={friends} alt="friends" />
            <p>Friends</p>
          </div>
          <div onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); navigate("/boosts")}} id="main_lower_boosts">
            <img src={boosts} alt="friends" />
            <p>Boosts</p>
          </div>
          <div onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); navigate("/chat")}} id="main_lower_clans">
            <img style={{height: "34px"}} src={chat} alt="friends" />
            <p>Chat</p>
            { (lastMes) && <div onClick={() => navigate('/chat')} id='main_last_message_container'>
              <div style={(band_colors[lastMes.band]) && { backgroundColor: band_colors[lastMes.band][0] }} id='main_last_message'>
                <p>{lastMes.name}</p>
                <p>:</p>
                <p>{lastMes.text}</p>
              </div>
              <div id='main_last_message_arrow'>
                <div style={(band_colors[lastMes.band]) && { background: `radial-gradient(circle at -1px 20px, transparent 80%, ${band_colors[lastMes.band][0]} 70%)` }}></div>
                <div style={(band_colors[lastMes.band]) && { background: `radial-gradient(circle at 20px 20px, transparent 80%, ${band_colors[lastMes.band][0]} 70%)` }}></div>
              </div>
            </div>}
          </div>
          <div onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); navigate("/clans")}} id="main_lower_clans">
            <img src={clans} alt="friends" />
            <p>Clans</p>
          </div>
        </div>
      </div>

      {
        Object.values(spawnNumbers).map(v => {
          return(
            <SpawnNumber x={v.x} y={v.y} value={multiplicator * multitap * levelMultitap}/>
          )
        })
      }
    <div id='main_achievments'>
      {
        Object.values(achievements).map( v => {
          return (
            <Achievement text={v.text} img={v.img} />
          )
        })
      }
    </div>
  </div>
  )
}

export default Main