import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import useSound from 'use-sound'
import tapSound from '../../audio/tap.mp3'

import config from "../../config"
import clans from "./img/clans.png"
import ninja from "./img/ninja.png"
import logo from "./img/logo.png"
import cross from "./img/cross.svg"
import "./Clans.css"
import Loader from "../../components/Loader/Loader";

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

const places = {
  1: "🥇",
  2: "🥈",
  3: "🥉"
}

const band_colors = {
  "Ballas": "rgba(123, 26, 255, 0.3)",
  "Grove Street": "rgba(66, 138, 70, 0.3)",
  "Grove": "rgba(66, 138, 70, 0.3)",
  "Vagos": "rgba(255, 198, 26, 0.3)",
  "Atztek": "rgba(244, 64, 16, 0.3)"
}

const CopyLink = ({ onClose, socket, id }) => {

  const onCopyLink = () => {
      navigator.clipboard.writeText(`${config.bot_url}?start=c_${id}_${window.Telegram.WebApp.initDataUnsafe.user.id}`).then(() => {
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
                      <p id='copy_link'>{`${config.bot_url}?start=c_${id}_${window.Telegram.WebApp.initDataUnsafe.user.id}`}</p>
                      <div id='copy_content_input'>
                          <p onClick={onCopyLink} className={`copy_input`}>Copy</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  )
}

const Clans = ({socket}) => {

  const [playTapSound] = useSound(tapSound)

    const [tgurl, setTgUrl] = useState("")
    const [formValid, setFormValid] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)
    const [hasClan, setHasClan] = useState(false)

    const [clanPhoto, setClanPhoto] = useState("")
    const [clanTitle, setClanTitle] = useState("")
    const [clanUrl, setClanUrl] = useState("")
    const [userClan, setUserClan] = useState("")

    const [clansList, setClansList] = useState([])
    const [membersList, setMembersList] = useState([])
    const [loading, setLoading] = useState(false)

    const [isUserClan, setIsUserClan] = useState(false)
    const [ showCopyRef, setShowCopyRef ] = useState(false)

    const navigate = useNavigate()


    useEffect(() => {
        window.Telegram.WebApp.BackButton.show()
        
        socket.on("error_clan", ({message}) => toast(message))
        socket.emit("is_in_clan", { tgid:  window.Telegram.WebApp.initDataUnsafe.user.id })
        socket.emit("get_clans", {})
        socket.emit("get_user_clan", { tgid:  window.Telegram.WebApp.initDataUnsafe.user.id })

        window.Telegram.WebApp.onEvent('backButtonClicked', () => navigate("/"))
        return () => window.Telegram.WebApp.offEvent('backButtonClicked', () => navigate("/"))
        
    }, [])


    socket.on("set_user_clan", ({ title }) => {
      setUserClan(title)
    })

    const onTgUrlChange = (e) => {
      const regex = /^https:\/\/t\.me\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/;
      if (isUserClan) {
        if (e.target.value !== "") {
          setFormValid(true)
        } else {
          setFormValid(false)
        }
      } else {
        if (regex.test(e.target.value)){
          setFormValid(true)
        } else {
          setFormValid(false)
        }
      }
      setTgUrl(e.target.value)
    }

    const onCreateClick = () => {
      if (formValid) {
          playTapSound()
          socket.emit("create_clan", { url: tgurl, tgid: window.Telegram.WebApp.initDataUnsafe.user.id, userClan: isUserClan })
        
      } else {
        toast("Paste link to your public telegram group")
      }
    }

    const onClanClick = (clan_id, title, url) => {
      setCreateOpen(false)
      setHasClan(true)
      setClanPhoto(config.back_url + `/clan_images/clan_${clan_id}.png`)
      setClanTitle(title)
      setClanUrl(url)
      window.Telegram.WebApp.BackButton.onClick(() => {
        setHasClan(false)
        setClanPhoto('')
        setClanTitle('')
        setClanUrl('')
      })

      if (title){
        socket.emit("get_clan_users", { title: title})
      }

      window.Telegram.WebApp.onEvent('backButtonClicked', () => {
        setHasClan(false)
        setClanPhoto('')
        setClanTitle('')
        setClanUrl('')
      })
      return () => window.Telegram.WebApp.offEvent('backButtonClicked', () => {
        setHasClan(false)
        setClanPhoto('')
        setClanTitle('')
        setClanUrl('')
      })
      
    }

    const onLeaveClan = () => {
      socket.emit("leave_clan", {tgid: window.Telegram.WebApp.initDataUnsafe.user?.id})
      socket.emit("get_clans", {})
      setHasClan(false)
      setClanPhoto('')
      setClanTitle('')
      setClanUrl('')
      setUserClan("")
    }

    const onEnterClan = () => {
      console.log("hey")
      socket.emit("enter_clan", { tgid: window.Telegram.WebApp.initDataUnsafe.user?.id, title: clanTitle })
      setUserClan(clanTitle)
      navigate("/")
      toast("You successfully joined the clan!")
    }

    const onInviteClan = () => {
      const id = parseInt(clanPhoto.replace(`${config.back_url}/clan_images/clan_`, "").replace(".png", ""))
      socket.emit("chanel_refferal", { clan_id: id, tg_id: window.Telegram.WebApp.initDataUnsafe.user?.id })
      window.Telegram.WebApp.openTelegramLink(config.bot_url)
      
    }

    socket.on("has_clan", ({clan, title, url}) => {
      setCreateOpen(false)
      setHasClan(true)
      setClanPhoto(config.back_url + `/clan_images/clan_${clan}.png`)
      setClanTitle(title)
      setClanUrl(url)
      if (title){
        socket.emit("get_clan_users", { title: title})
      }
    })

    socket.on("set_clans", ({ clans }) => {
      setLoading(false)
      setClansList(clans)
    })

    socket.on("clan_list_loading", ({ }) => {
      setLoading(true)
    })

    socket.on("set_clan_users", ({ members }) => {
      setLoading(false)
      setMembersList(members)
    })

  return (
    <div id='clans_main'>
        { (!hasClan) && <div id='clans_upper'>
            <img src={clans} alt='clans' />
            <h1>Join the clans</h1>
            <p onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); setCreateOpen(true); setIsUserClan(false) }}>Join Telegram Channel</p>
            <p onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); setCreateOpen(true); setIsUserClan(true) }}>Create clan</p>
        </div>}
        {
          (hasClan) && <div id='clans_upper_in_clan'>
            <div id='clan_info'>
              <img src={(clanUrl.startsWith("https")) ? clanPhoto : logo} alt='clan' />
              <h1 id={`${(clanUrl.startsWith("https")) && 'clickable'}`} onClick={() => {(clanUrl.startsWith("https")) && window.Telegram.WebApp.openTelegramLink(clanUrl)}}>{clanTitle}</h1>
            </div>
            <div id='clan_actions'>
              <p onClick={() => setShowCopyRef(true)}>Invite Friend</p>
              <p onClick={() => {(clanTitle !== userClan) ?  onEnterClan() : onLeaveClan(); window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound()}}>{(clanTitle !== userClan) ? "Join Clan" :"Leave Clan"}</p>
            </div>
      </div>
        }
        <div style={{flex: "auto"}} id='clans_list'>

          {
            (loading) && <Loader/>
          }

          {
            (!hasClan) && Object.entries(clansList).map(([index, v]) => {
              console.log(v)
              return(
                <div onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); onClanClick(v['id'], v['title'], v['url'])}} className='clans_clan'>
                  <div className='clans_clan_avatar'>
                    <img src={(v['url'].startsWith("https")) ? config.back_url + `/clan_images/clan_${v['id']}.png` : logo} alt='clan' />
                    <p>{formatSI(v['members'])}{(v['members'] > 1000) && " +"}</p>
                  </div>
                  <div className='clans_clan_info'>
                    <h3>{v['title']}</h3>
                    <h4>{formatSI(v['score']).replace("y", "")}</h4>
                  </div>
                  <div className={`clans_clan_place ${(parseInt(index) + 1 > 3) && 'num'}`}>
                    <p>{(parseInt(index) + 1 > 3) ? parseInt(index) + 1 : places[parseInt(index) + 1]}</p>
                  </div>
                </div>
              )
            })
          }

          {
            (hasClan) && Object.entries(membersList).map(([index, v]) => {
              console.log(index, v)
              return(
                <div onClick={() => window.Telegram.WebApp.openTelegramLink(`https://t.me/${v.username}`)} className='clan_member' style={{backgroundColor: band_colors[v.band]}}>
                  <div className='clan_member_avatar' style={(v.photo) && {background: `url(${v.photo})`, backgroundRepeat: "no-repeat", backgroundPosition: "50% 50%", backgroundSize: "100%"}}>
                    <div className='clan_member_avatar_circle'>
                      <p>{v.level}</p>
                    </div>
                  </div>
                  <div className='clan_member_info'>
                    <h3>{v.name}</h3>
                    <h4>{v.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</h4>
                  </div>
                  <div className='clan_member_place'>
                    <p className={(parseInt(index) + 1 > 3) ? 'clan_member_place_num' : ''}>{(parseInt(index) + 1 > 3) ? parseInt(index) + 1 : places[parseInt(index) + 1]}</p>
                  </div>
                </div>
              )
            })
          }

          {(createOpen) && <div className={`clan_create ${createOpen ? "opened" : "closed"}`}>
            <div id='clan_create_invite'>
              <div id='clan_create_close'>
                <div onClick={() => { window.Telegram.WebApp.HapticFeedback.impactOccurred("soft"); playTapSound(); setCreateOpen(false)}} id='clan_create_close_circle'>
                  <img src={cross} alt="cross"/>
                </div>
              </div>
              <img id='clan_create_invite_img' src={ninja} alt='ninja'/>
              <h2>{ (isUserClan) ? "Create clan" : "Create Telegram Clan" }</h2>
              <p>{ (isUserClan) ? "Write clan name" : "Paste link to your public telegram group"}</p>
            </div>
            <div className={`clan_create_input ${formValid ? "enabled" : "disabled"}`}>
              <input value={tgurl} onChange={onTgUrlChange}/>
              <p onClick={onCreateClick}>Create</p>
            </div>
          </div>}
        </div>
        { (showCopyRef) && <CopyLink id={parseInt(clanPhoto.replace(`${config.back_url}/clan_images/clan_`, "").replace(".png", ""))} socket={socket} onClose = {() => setShowCopyRef(false)} />}
    </div>
  )
}

export default Clans