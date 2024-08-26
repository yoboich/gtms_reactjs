import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TonConnectButton, useTonAddress  } from '@tonconnect/ui-react'
import useSound from 'use-sound'
import tapSound from '../../audio/tap.mp3'
import './Boosts.css'
import arrow from './img/arrow.svg'
import cross from './img/cross.svg'
import check from './img/check.svg'
import config from '../../config'

const TaskWindow = ({ selTask, onClose, onJoinClose, socket }) => {

    const userFriendlyAddress = useTonAddress();
    const navigate = useNavigate()

    useEffect(() => {
        if ((userFriendlyAddress !== '') && (selTask.type === 'wallet')) {
            socket.emit("set_user_wallet", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id, wallet: userFriendlyAddress})
            socket.emit("mark_task_checked", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id, taskid: selTask.id, taskSum: selTask.bonus })
            onJoinClose()
        }
    }, [userFriendlyAddress])

    const onJoin = () => {
        if (selTask.link.includes("t.me")) {
            window.Telegram.WebApp.openTelegramLink(selTask.link)
        } else {
            if (selTask.type === "eday") {
                
            } else {
                if (selTask.type === "chat") {
                    navigate(selTask.link)
                } else {
                    window.Telegram.WebApp.openLink(selTask.link)
                }
            }
        }
        if ((selTask.type !== "chat") && (selTask.type !== "telegram")) {
            socket.emit("mark_task_checked", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id, taskid: selTask.id, taskSum: selTask.bonus })
        }
        onJoinClose()
    }

    return (
        <div id='task_background'>
            <div id='task_main_back'>
                <div id='task_main'>
                    <div id='task_info'>
                        <div id='task_main_cross_container'>
                            <div onClick={onClose} id='task_main_cross_circle'>
                                <img src={cross} alt='cross'/>
                            </div>    
                        </div>
                        <img src={config.back_url + `/tasks_logo/task_${selTask.type}.png`} alt='logo'/>
                        <h2>{selTask.title}</h2>
                    </div>
                    <div id='task_button'>
                        <h3>+{selTask.bonus.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h3>
                        {(selTask.type === "wallet") && <TonConnectButton />}
                        {(selTask.type !== "wallet") && <h2 onClick={onJoin}>{ (selTask.type === "eday") ? "Claim" :  "Join" }</h2>}
                    </div>
                </div>
            </div>
        </div>
    )
}

const Boosts = ({socket, score, level, multitap, setScore, setMultitap}) => {

    const [playTapSound] = useSound(tapSound)

    const navigate = useNavigate()

    

    const [tasks, setTasks] = useState([])
    const [selTask, setSelTasks] = useState({})
    

    useEffect(() => {
        window.Telegram.WebApp.BackButton.show()
        window.Telegram.WebApp.BackButton.onClick(() => navigate("/"))
        socket.emit("get_tasks", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id })
        return () => window.Telegram.WebApp.BackButton.onClick(() => {})
    }, [])

    socket.on("send_tasks", (tasks) => {
        const stasks = tasks.sort((x, y) => {return (x.checked === y.checked)? 0 : x.checked? 1 : -1})
        console.log(stasks)
        setTasks(stasks)
    })

    
    const onMultitapClick = () => {
        if ((score >= 50000 * multitap)) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred("soft")
            playTapSound()
            socket.emit("set_multitap", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id , multitap: multitap + 1, score: parseInt(score) - parseInt(50000 * multitap) })
            setScore(parseInt(score) - parseInt(50000 * multitap))
            setMultitap(multitap + 1)
        }
    }

    const onTaskClose = () => {
        setSelTasks({})
    }

    const onTaskJoinClose = () => {
        console.log(selTask)
        if (selTask.type !== 'telegram') {
            setTasks(tasks.map(v => {
                if (v.id === selTask.id) {
                    v['checked'] = true
                    return v
                } else {
                    return v
                }
            }))
            setScore(score + selTask.bonus)
        }
        setSelTasks({})
    }

    const onTaskClick = (v) => {
        if (v.type != 'telegram') {
            setSelTasks(v)
        } else {
            socket.emit("check_tg_sub", { tgid: window.Telegram.WebApp.initDataUnsafe.user.id, task: v })
        }
    }

    socket.on("sub", ({ task }) => {
            setTasks(tasks.map(v => {
                if (v.id === task.id) {
                    v['checked'] = true
                    return v
                } else {
                    return v
                }
            }))
            console.log(task)
            setScore(score + parseInt(task.bonus))
        
    })

    socket.on("not_sub", ({ task }) => {
        setSelTasks(task)
    })

  return (
    <div id='boosts_main'>
        <div id='boosts_score'>
            <h1>{score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</h1>
            <p>Level {level}</p>
        </div>
        <div id='boost_boosters'>
            <h2>Boosters</h2>
            <div id='boost_boosters_container'>
                <div onClick={onMultitapClick} className={`boost_item ${(score < multitap*50000) && "disabled"}`}>
                    <div className='boost_item_info'>
                        <div className='boost_item_photo'>
                            <span>☝️</span>
                        </div>
                        <div className='boost_item_content'>
                            <h3>Multitap</h3>
                            <div>
                                <p>{multitap * 50000}</p>
                                <p>{ multitap } lvl</p>
                            </div>
                        </div>
                    </div>
                    <div className='boost_item_arrow'>
                        <img src={arrow} alt='arrow'/>
                    </div>
                </div>
            </div>
        </div>
        <div id='boost_tasks'>
            <h2>Tasks</h2>
            <div id='boost_tasks_container'>

                {
                    (tasks.length < 1) && <div className='boost_tasks_item void'>
                        <p>No tasks</p>
                    </div>
                }
                
                {
                    (tasks.length > 0) && Object.values(tasks).map(v => {
                        return (
                            <div onClick={() => (!v.checked) && onTaskClick(v)} className={`boost_tasks_item ${ (v.checked) ? 'checked' : ''}`}>
                                <div className='boost_tasks_item_info'>
                                    <div className={`boost_tasks_item_photo ${(v.type === "x") ? 'x' : ''}`}>
                                        <img src={config.back_url + `/tasks_logo/task_${v.type}.png`} alt='logo'/>
                                    </div>
                                    <div className='boost_tasks_item_content'>
                                        <h3>{v.title}</h3>
                                        <p>+{v.bonus.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                                    </div>
                                </div>
                                <div className='boost_tasks_item_arrow'>
                                    <img src={(v.checked) ? check : arrow} alt='arrow'/>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
        { (selTask.id) && <TaskWindow socket={socket} onJoinClose={onTaskJoinClose} onClose={onTaskClose} selTask={selTask} />}
    </div>
  )
}

export default Boosts