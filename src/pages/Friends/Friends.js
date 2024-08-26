import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

import config from '../../config'
import default_user from './img/default_user.png'
import friends_png from './img/Friends.png'
import cross from './img/cross.svg'
import './Friends.css'

const MultiRef = ({ onClose, socket }) => {

    const [formValid, setFormValid] = useState(false)
    const [tgUrl, setTgUrl] = useState('')

    const onTgUrlChange = (e) => {
        const regex = /^https:\/\/t\.me\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/;
        if (regex.test(e.target.value)){
          setFormValid(true)
        } else {
          setFormValid(false)
        }
        
        setTgUrl(e.target.value)
      }

    const onSendChannel = () => {
        if (formValid) {
            socket.emit("create_multi_refferal", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id, tgurl: tgUrl})
        }
    }

    socket.on("error_multiref", ({message}) => toast(message))

    socket.on("create_mr_link", ({}) => {
        window.Telegram.WebApp.openTelegramLink(config.bot_url)
    })

    return (
        <div id='multiref_background'>
            <div id='multiref_main_back'>
                <div id='multiref_main'>
                    <div id='multiref_close'>
                        <div onClick={onClose} id='multiref_close_circle'>
                            <img src={cross} alt='cross' />
                        </div>
                    </div>
                    <div id='multiref_content'>
                        <h2>Multi Referral</h2>
                        <p>Multi referral link gives you 1M tokens for each friend</p>
                        <h3>To get this link you must:</h3>
                        <div id='multiref_content_list'>
                            <p>1. Add this bot to the admins of your channel which has 10k+ subscribers</p>
                            <p>2. Paste your channel link below</p>
                        </div>

                        <div id='multiref_content_input'>
                            <input value={tgUrl} onChange={onTgUrlChange} />
                            <p onClick={onSendChannel} className={`multiref_input ${(!formValid) && "disabled"}`}>Create link</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const CopyLink = ({ onClose, socket }) => {

    const onCopyLink = () => {
        navigator.clipboard.writeText(`${config.bot_url}?start=r_${window.Telegram.WebApp.initDataUnsafe.user.id}`).then(() => {
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
                        <p id='copy_link'>{`${config.bot_url}?start=r_${window.Telegram.WebApp.initDataUnsafe.user.id}`}</p>
                        <div id='copy_content_input'>
                            <p onClick={onCopyLink} className={`copy_input`}>Copy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Friends = ({socket}) => {

    const [ friendsCount, setFriendsCount ] = useState(0)
    const [ earned, setEarned ] = useState(0)
    const [ showMultiRef, setShowMultiRef ] = useState(false)
    const [ showCopyRef, setShowCopyRef ] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        window.Telegram.WebApp.BackButton.show()
        window.Telegram.WebApp.BackButton.onClick(() => navigate("/"))

        socket.emit("get_friends_info", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id })

        return () => window.Telegram.WebApp.BackButton.offClick(() => {})
    }, [])

    socket.on("send_friends_info", (data) => {
        console.log(data)
        setFriendsCount(data['count'])
        setEarned(data['earned'])
    })

    const onInviteClick = () => {
        socket.emit("refferal", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id })
        window.Telegram.WebApp.openTelegramLink(config.bot_url)
    }

  return (
    <div id="friends_main">
        <div id="friends_upper">
            <img src={friends_png} alt="friends" />
            <h1>{friendsCount} Friends</h1>
        </div>
        <div id="friends_earned">
            <p>+{earned} GTM Coins</p>
        </div>
        <p id="friends_invite">Invite friends to get bonuses</p>
        <div id="friends_awards">
            <div id="friends_awards_block">
                <div id="friends_awards_default">
                    <img src={default_user} alt="default_user" />
                    <p>Telegram user</p>
                    <h2>100 000</h2>
                </div>
            </div>
            <div id="friends_awards_block_text">
                <p>FOR YOU AND FRIENDS</p>
            </div>
        </div>
        <div onClick={() => setShowCopyRef(true)} id="friends_invite_button">
            <p>Invite friends</p>
        </div>
        <div onClick={() => setShowMultiRef(true)} id="friends_multiref_button">
            <p>Multi Referral</p>
        </div>
        { (showCopyRef) && <CopyLink socket={socket} onClose = {() => setShowCopyRef(false)} />}
        { (showMultiRef) && <MultiRef socket={socket} onClose = {() => setShowMultiRef(false)} />}
    </div>
  )
}


export default Friends