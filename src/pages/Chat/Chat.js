import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ballas from './img/ballas.png'
import gs from './img/GS.png'
import vagos from './img/Vagos.png'
import atztek from './img/Atztek.png'
import './Chat.css'
import Loader from '../../components/Loader/Loader'

const Chat = ({ socket, userBand, userName }) => {

    const [inputText, setInputText] = useState('')
    const [messages, setMessages] = useState([])
    const [isMessagesLoading, setIsMessagesLoading] = useState(false)
    const [messageOffset, setMessageOffset] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [myPhoto, setMyPhoto] = useState('')

    const chat_input = useRef()
    const messages_container = useRef()

    const navigate = useNavigate()

    useEffect(() => {
        setIsLoading(true)
        socket.emit("get_messages", { offset: messageOffset })

        socket.emit("get_photo", { username: window.Telegram.WebApp.initDataUnsafe.user.username})

        window.Telegram.WebApp.BackButton.show()
        window.Telegram.WebApp.onEvent('backButtonClicked', () => navigate("/"))
        return () => window.Telegram.WebApp.offEvent('backButtonClicked', () => navigate("/"))
    }, [])

    socket.on("send_photo", ({ photo }) => {
        setMyPhoto(photo)
    })

    socket.on("send_messages", ({ messages }) => {
        setMessages(messages)
        setIsLoading(false)
    })

    socket.on("add_messages", (data) => {
        const t_messages = data['messages']
        
        if (t_messages) {
            if (t_messages.length > 0) {
                setMessages([
                    ...messages,
                    ...t_messages,
                ])
                setIsMessagesLoading(false)
            }
        }
    })

    
    socket.on("sended_message", ({tgid, text, band, name, sent, photo}) => {
        if (tgid !== window.Telegram.WebApp.initDataUnsafe.user.id) {
            setMessages([
                {
                    tgid: tgid,
                    text: text,
                    name: name,
                    band: band,
                    sent: sent,
                    photo: photo
                },
                ...messages
            ])
        }
    })

    const onChatInputChange = (e) => {
        chat_input.current.style.height = "0px";
        chat_input.current.style.height = chat_input.current.scrollHeight - 10 + "px";
        setInputText(e.target.value)
    }

    const onSendClick = () => {
        if (inputText !== "") {
            socket.emit("send_message", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id, text: inputText})

            setMessages([
                {
                    tgid: window.Telegram.WebApp.initDataUnsafe.user.id,
                    text: inputText,
                    name: userName,
                    band: userBand,
                    sent: (new Date().getTime()) / 1000,
                    photo: myPhoto
                },
                ...messages
            ])
            setInputText("")
            chat_input.current.style.height = "20px";
        }
    }

    const onScrolling = () => {
        const mes_block =  document.getElementById('chat_messages')
        const cur_scroll = ( mes_block.offsetHeight + Math.abs(mes_block.scrollTop)) * 100 / mes_block.scrollHeight
        if ((cur_scroll >= 90) && (!isMessagesLoading)) {
            const mes = document.getElementsByClassName('message_item')
            socket.emit("get_messages", { offset: mes.length })
            setIsMessagesLoading(true)
        }
    }

    const band_colors = {
        "Ballas": ["#7b1aff", "#610cd5"],
        "Grove Street": ["#428a46", "#357038"],
        "Grove": ["#428a46", "#357038"],
        "Vagos": ["#ffc61a", "#cc9712"],
        "Atztek": ["#f44010", "#c73623"]
    }

    const empty_band = {
        "Ballas": ballas,
        "Grove Street": gs,
        "Grove": gs,
        "Vagos": vagos,
        "Atztek": atztek
    }

    const band_avatar_colors = {
        "Ballas": ["rgba(123, 26, 255, 0.3)", "rgba(97, 12, 213, 0.3)"],
        "Grove Street": ["rgba(66, 138, 70, 0.3)", "rgba(53, 112, 56, 0.3)"],
        "Grove": ["rgba(66, 138, 70, 0.3)", "rgba(53, 112, 56, 0.3)"],
        "Vagos": ["rgba(255, 198, 26, 0.3)", "rgba(204, 151, 18, 0.3)"],
        "Atztek": ["rgba(244, 64, 16, 0.3)", "rgba(199, 54, 35, 0.3)"]
    }

  return (
    <div id='chat_main'>
        { (isLoading) && <Loader/> }
        { (!isLoading) && <div ref={messages_container} onScroll={onScrolling} id='chat_messages'>
            { (messages.length < 1) && <span id='chat_messages_empty'>No messages</span>}
            {
                (messages.length > 0) &&
                Object.values(messages).map((v, i) => {
                    let is_last = false
                    let first_date = false
                    let d_value = new Date(v.sent * 1000).toDateString().slice(4, 10).split(" ").reverse()

                    if (i === messages.length - 1) first_date = true

                    if (messages[ i + 1 ]) {         
                             
                        if (new Date(v.sent * 1000).getDate() > new Date(messages[i+1].sent * 1000).getDate()) {
                            first_date = true
                        }
                    }

                    if (messages[ i - 1 ]) {                
                        if ( messages[ i - 1 ].tgid !== v.tgid) {
                            is_last = true
                        }

                        if (new Date(v.sent * 1000).getDate() < new Date(messages[i-1].sent * 1000).getDate()) {
                            is_last = true
                        }
                        
                    } else {
                        is_last = true
                    }

                    const d = new Date(v.sent * 1000)
                    let hours = d.getHours().toString()
                    if (hours.length < 2) {
                        hours = "0" + hours
                    }
                    let minutes = d.getMinutes().toString()
                    if (minutes.length < 2) {
                        minutes = "0" + minutes
                    }
                    return (
                        <>
                            <div className={`message_item ${(v.tgid === window.Telegram.WebApp.initDataUnsafe.user.id) ? 'my' : ''} ${(!is_last) ? 'no_tail' : ''}`}>
                                {
                                    <div style={{backgroundColor: (v.tgid === window.Telegram.WebApp.initDataUnsafe.user.id) ? (band_avatar_colors[v.band]) ? band_avatar_colors[v.band][0] : band_avatar_colors['Ballas'][0] : (band_avatar_colors[v.band]) ? band_avatar_colors[v.band][1] : band_avatar_colors['Ballas'][1] }} className='message_item_photo'>
                                        <img src={(v.photo !== 'empty') ? v.photo : empty_band[v.band]} alt='photo'/>
                                    </div>
                                }
                                {(is_last) && <div className='message_tail_container'>
                                    <div style={{background: `radial-gradient(18px 27px at ${(v.tgid === window.Telegram.WebApp.initDataUnsafe.user.id) ? 'right' : 'left'} top , transparent 60%, ${(v.tgid === window.Telegram.WebApp.initDataUnsafe.user.id) ? band_colors[v.band][1] : band_colors[v.band][0]} 60%)`}} className='message_tail'>
                                    </div>
                                </div>}
                                <div style={{background: `linear-gradient(130deg, ${band_colors[v.band][0]}, ${band_colors[v.band][1]})`}} className='message_content'>
                                    <div className='message_item_from'>
                                        <span>{v.name}</span>
                                    </div>
                                    <div dangerouslySetInnerHTML={{ __html: v.text.replace(/\n/g, "<br />")}} className='message_item_text'>
                                    </div>
                                    <div className='message_item_time'>
                                        <span>{`${hours}:${minutes}`}</span>
                                    </div>
                                </div>
                            </div>
                            {
                                (first_date) &&
                                <div className='message_day_month'>
                                    <span>{`${d_value[0]} ${d_value[1]}`}</span>
                                </div>
                            }
                        </>
                    )
                })
            }
        </div>}
        <div id="chat_input">
            <textarea ref={chat_input} value={inputText} onChange={onChatInputChange}/>
            <div onClick={onSendClick} id='chat_input_button'>
                <span/>
            </div>
        </div>
    </div>
  )
}

export default Chat