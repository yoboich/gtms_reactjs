import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import "./Map.css"

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

const round = (value) => {
    return Math.round(value * 100) / 100;
}

const Map = ({ socket }) => {

    const [atztekScore, setAtztekScore] = useState(0)
    const [vagosScore, setVagosScore] = useState(0)
    const [gsScore, setGSScore] = useState(0)
    const [ballasScore, setBallasScore] = useState(0)
    const [atztekPerc, setAtztekPerc] = useState(0.01)
    const [vagosPerc, setVagosPerc] = useState(0.01)
    const [gsPerc, setGSPerc] = useState(0.01)
    const [ballasPerc, setBallasPerc] = useState(0.01)
    const [clickedSum, setClickedSum] = useState(0)
    const [online, setOnline] = useState(0)

    const navigate = useNavigate()

    useEffect(() => {
        window.Telegram.WebApp.BackButton.show()
        window.Telegram.WebApp.BackButton.onClick(() => navigate("/"))
        socket.emit("get_all_bands_score", {})
        return () => window.Telegram.WebApp.BackButton.offClick(() => navigate("/"))
    }, [])

    useEffect(() => {
        if (ballasPerc === 0) {
            setBallasPerc(0.01)
            setGSPerc(gsPerc - 0.01)
        }
        if (vagosPerc === 0) {
            setVagosPerc(0.01)
            setAtztekPerc(atztekPerc - 0.01)
        }
        if (atztekPerc === 0) {
            setAtztekPerc(0.01)
            setVagosPerc(vagosPerc - 0.01)
        }
        if (gsPerc === 0) {
            setGSPerc(0.01)
            setBallasPerc(ballasPerc - 0.01)
        }
    }, [ballasPerc, vagosPerc, atztekPerc, gsPerc])

    socket.on("send_all_bands_score", (res) => {
        setAtztekScore(res['atztek'])
        setVagosScore(res['vagos'])
        setGSScore(res['gs'])
        setBallasScore(res['ballas'])
        setClickedSum(res['sum'])
        setOnline(res['players'])
        console.log(res)

        if (res['atztek'] === 0) {
             setAtztekPerc(0.01)
        } else {
            setAtztekPerc( round(res['atztek'] / res['sum']) )
        }

        if (res['vagos'] === 0) {
            setVagosPerc(0.01)
        } else {
            setVagosPerc( round(res['vagos'] / res['sum']) )
        }

        if (res['gs'] === 0) {
            setGSPerc(0.01)
        } else {
            setGSPerc( round(res['gs'] / res['sum']) )
        }

        if (res['ballas'] === 0) {
            setBallasPerc(0.01)
        } else {
            setBallasPerc( round(res['ballas'] / res['sum']) )
        }

        if ((res['atztek'] === 0) && (res['vagos'] === 0) && (res['gs'] === 0) && (res['ballas'] === 0)) {
            setVagosPerc(1)
            setBallasPerc(1)
            setGSPerc(1)
            setAtztekPerc(1)
        }
    })

  return (
    <div id='map_main'>
    <div id='map_stats'>
        <h2>Online statistics</h2>
        <p>Online: {online}</p>
        <p>Mined: {formatSI(clickedSum)} GTM</p>
    </div>
    <div id='map_map'>
        <div id='map_bands'>
                <div id='map_atztek' style={{flex: atztekPerc}}>
                    <p>{formatSI(atztekScore)} | {(atztekPerc * 100).toFixed(0)}%</p>
                </div>    
                <div id='map_vagos' style={{flex: vagosPerc}}>
                    <p>{formatSI(vagosScore)} | {(vagosPerc * 100).toFixed(0)}%</p>
                </div>    
                <div id='map_gs' style={{flex: gsPerc}}>
                    <p>{formatSI(gsScore)} | {(gsPerc * 100).toFixed(0)}%</p>
                </div>    
                <div id='map_ballas' style={{flex: ballasPerc}}>
                    <p>{formatSI(ballasScore)} | {(ballasPerc * 100).toFixed(0)}%</p>
                </div>    
            </div>
        </div>
    </div>
  )
}

export default Map
