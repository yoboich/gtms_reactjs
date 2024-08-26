import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import cross from './img/cross.svg'
import { toast } from 'react-toastify'
import config from '../../config'
import useSound from 'use-sound'
import tapSound from '../../audio/tap.mp3'
import "./BandStats.css"

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

  const CopyLink = ({ onClose, socket, band }) => {

    const onCopyLink = () => {
        navigator.clipboard.writeText(`${config.bot_url}?start=g_${window.Telegram.WebApp.initDataUnsafe.user.id}_${band}`).then(() => {
            toast("Link successfully copied!")
        })
    }

    return (
        <div id='copy_background'>
            <div id='copy_main_back'>
                <div id='copy_main'>
                    <div id='copy_close'>
                        <div onClick={onClose} id='copy_close_circle'>
                            <img src={cross} alt='cross' />
                        </div>
                    </div>
                    <div id='copy_content'>
                        <h2>Your refferal link</h2>
                        <p>Just copy and send it to your friend!</p>
                        <p id='copy_link'>{`${config.bot_url}?start=g_${window.Telegram.WebApp.initDataUnsafe.user.id}_${band}`}</p>
                        <div id='copy_content_input'>
                            <p onClick={onCopyLink} className={`copy_input`}>Copy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
  
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

const BandStats = ({ socket, Band }) => {

    const [playTapSound] = useSound(tapSound)

    const navigate = useNavigate()

    const [stats, setStats] = useState([])
    const [ showCopyRef, setShowCopyRef ] = useState(false)

    const onInviteClick = () => {
        socket.emit("refferal_gang", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id })
        window.Telegram.WebApp.openTelegramLink(config.bot_url)
    }

    useEffect(() => {
        window.Telegram.WebApp.BackButton.show()
        window.Telegram.WebApp.BackButton.onClick(() => {playTapSound(); navigate("/")})
        socket.emit("get_all_bands_stats", {})
        return () => window.Telegram.WebApp.BackButton.offClick(() => {})
    }, [])

    socket.on("send_all_bands_stats", (res) => {
        setStats(res)
    })


  return (
    <div id='bandStats_main'>
        <h1>Statistics</h1>
        <div id='bandStats_container'>
            <div id="bandStats_title">
                <p>Band:</p>
                <p>Players:</p>
                <p>Mined:</p>
            </div>
            {
                Object.values(stats).map(v => {
                    return (
                        <div className='bandStats_row'>
                            <p>{v.name}</p>
                            <p>{v.players}</p>
                            <p>{formatSI(v.score)}</p>
                        </div>
                    )
                })
            }
        </div>
        <div id='bandStats_invite'>
            <p onClick={() => setShowCopyRef(true)}>Join a gang</p>
        </div>
        { (showCopyRef) && <CopyLink band={Band} socket={socket} onClose = {() => setShowCopyRef(false)} />}
    </div>
  )
}

export default BandStats