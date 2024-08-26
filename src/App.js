import { useState, useEffect, useLayoutEffect, lazy, Suspense } from "react";
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import { ToastContainer, Zoom } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client'
import config from "./config";
import './App.css';
import Loader from "./components/Loader/Loader";
import mySound from './audio/mission_complete.mp3'
import useSound from 'use-sound'
import Chat from "./pages/Chat/Chat";
import { on } from '@telegram-apps/sdk';

const Main = lazy(() => import("./pages/Main/Main"))
const Friends = lazy(() => import("./pages/Friends/Friends"))
const Clans = lazy(() => import("./pages/Clans/Clans"))
const Map = lazy(() => import("./pages/Map/Map"))
const SelectBand = lazy(() => import("./pages/SelectBand/SelectBand"))
const GameEnd = lazy(() => import("./pages/GameEnd/GameEnd"))
const BandStats = lazy(() => import("./pages/BandStats/BandStats"))
const Boosts = lazy(() => import("./pages/Boosts/Boosts"))





const socket = io.connect(config.socket_addr, {query: `tgid=${window.Telegram.WebApp.initDataUnsafe.user.id}`})

function App() {

  const location = useLocation()
  const navigate = useNavigate()

  const [auth, setAuth] = useState(false)
  const [gameEnd, setGameEnd] = useState(false)

  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransistionStage] = useState("fadeIn");
  const [loading, setLoading] = useState(true)

  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [band, setBand] = useState("Ballas")
  const [bandScore, setBandScore] = useState(0)
  const [lastMes, setLastMes] = useState({})
  const [multitap, setMultiTap] = useState(0)
  const [username, setUsername] = useState('')

  const [playSound] = useSound(mySound)
  const [achievements, setAchievements] = useState([])

  
  

  socket.on("auth", () => {
    setAuth(true);
    setTimeout(() => setLoading(false), 1000)
  })
  socket.on("no_auth", () => {
    setAuth(false);
    setTimeout(() => setLoading(false), 1000)
  })
  socket.on("end_game", () => {
    if (!gameEnd) {
      setGameEnd(true)
    }
  })

  useEffect(() => {
    if (gameEnd === true) {
      if (location.pathname !== "/gameEnd"){
        navigate("/gameEnd")
      }
    } else navigate("/")
  }, [gameEnd])

  useEffect(() => {
    socket.emit("get_main_info", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id })
    window.Telegram.WebApp.expand()
    window.Telegram.WebApp.disableVerticalSwipes()
    window.Telegram.WebApp.setHeaderColor("#020200")

    const overflow = 100
    const root = document.getElementById('root')
    root.style.overflowY = 'hidden'
    root.style.marginTop = `${overflow}px`
    root.style.height = window.innerHeight + overflow + "px"
    root.style.paddingBottom = `${overflow}px`
    window.scrollTo(0, overflow)
    window.scroll(0, overflow)
  }, [])

  socket.on("send_main_info", (user) => {
    if (user.score > score) {
      
      setScore(user.score)
    }
    setLastMes(user.l_mes)
    setLevel(user.level)
    setBand(user.band)
    setBandScore(user.bandScore)
    setMultiTap(user.multitap)
    setUsername(user.name)
  })

  useEffect(() => {
    if (location !== displayLocation) setTransistionStage("fadeOut");
  }, [location, displayLocation]);

  useEffect(() => {
    if (config.levels[level]) {
      if (score >= config.levels[level][0]) {
        playSound()
        if ((level + 1) === 5) {
          setScore(score + 100000)
          socket.emit("user_click", {tgid: window.Telegram.WebApp.initDataUnsafe.user.id, add: score + 100000})
          setAchievements([
            ...achievements,
            {
              text: "Глава банды",
              img: 'band_boss.png'
            }
          ])
          setTimeout(() => setAchievements([]), 1500)
        } else if ((level + 1) === 10) {
          setScore(score + 1000000)
          socket.emit("user_click", {tgid: window.Telegram.WebApp.initDataUnsafe.user.id, add: score + 1000000})
          setAchievements([
            ...achievements,
            {
              text: "Босс мафии",
              img: 'mafia_boss.png'
            }
          ])
          setTimeout(() => setAchievements([]), 5000)
        }
        setLevel(level + 1)
        setScore(score + config.levels[level][1])
        socket.emit("user_levelup", {tgid: window.Telegram.WebApp.initDataUnsafe.user.id, add: 1})
        socket.emit("user_click", {tgid: window.Telegram.WebApp.initDataUnsafe.user.id, add: score + config.levels[level][1]})
      }
    }
  }, [score])


  return (
    <div
      
      className={`${transitionStage}`}
      onAnimationEnd={() => {
        if (transitionStage === "fadeOut") {
          setTransistionStage("fadeIn");
          setDisplayLocation(location);
        }
      }}
    >
        <Routes location={displayLocation}>
            <Route path="/" element={
              (loading) ?
              <Loader/>
              :
              <Suspense fallback={<Loader/>}>
                {((auth) && (!gameEnd)) ? 
                <Main 
                  score={score}
                  setScore={setScore}
                  socket={socket}
                  level={level}
                  band={band}
                  bandScore={bandScore}
                  lastMes={lastMes}
                  setLastMes={setLastMes}
                  multitap={multitap}
                  achievements={achievements}
                /> : <SelectBand socket={socket} setBand={setBand} changeAuth={() => setAuth(true)} />}
              </Suspense>
            }/>
            <Route path="/friends" element={
              <Suspense fallback={<Loader/>}>
                <Friends socket={socket}/>
              </Suspense>
            }/>
            <Route path="/clans" element={
              <Suspense fallback={<Loader/>}>
                <Clans socket={socket}/>
              </Suspense>
            }/>
            <Route path="/map" element={
              <Suspense fallback={<Loader/>}>
                <Map socket={socket}/>
              </Suspense>
            }/>
            <Route path="/band_stats" element={
              <Suspense fallback={<Loader/>}>
                <BandStats Band={band} socket={socket}/>
              </Suspense>
            }/>
            <Route path="/boosts" element={
              <Suspense fallback={<Loader/>}>
                <Boosts score={score} level={level} multitap={multitap} setMultitap={setMultiTap} setScore={setScore} socket={socket}/>
              </Suspense>
            }/>
            <Route path="/gameEnd" element={
              <Suspense fallback={<Loader/>}>
                <GameEnd/>
              </Suspense>
            }/>
            <Route path="/chat" element={
              <Suspense fallback={<Loader/>}>
                <Chat userName={username} userBand={band} socket={socket}/>
              </Suspense>
            }/>
        </Routes>
      <ToastContainer hideProgressBar={true} closeButton={false} limit={1} theme="dark" p autoClose={1000} transition={Zoom} position="top-center" />
    </div>
  );
}

export default App;
