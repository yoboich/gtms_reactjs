import React, { useState } from 'react'
import band from './img/band.png'
import ballas from './img/ballas.png'
import gs from './img/GS.png'
import vagos from './img/Vagos.png'
import atztek from './img/Atztek.png'
import "./SelectBand.css"

const SelectBand = ({ socket, changeAuth, setBand }) => {

    const [selectedBand, setSelectedBand] = useState("Ballas")

    const onConfirmClick = () => {
        changeAuth()
        socket.emit("select_band", { 
            tgid: window.Telegram.WebApp.initDataUnsafe.user.id,
            band: selectedBand
        })
        setBand(selectedBand)
    }

  return (
    <div id='select_main'>
        <div id='select_invite'>
            <img src={band} alt='band'/>
            <h1>Select your Gang</h1>
            <p>You can only choose a gang once, it will affect your winnings.</p>
        </div>
        <div id='select_list'>
            <div onClick={() => setSelectedBand("Ballas")} className='select_block ballas'>
                <div className='select_avatar ballas'>
                    { (selectedBand === "Ballas") &&<img src={ballas} alt='ballas' /> }
                </div>
                <div className='select_name'>
                    <h2>Ballas</h2>
                </div>
            </div>
            <div onClick={() => setSelectedBand("Grove Street")} className='select_block gs'>
                <div className='select_avatar gs'>
                    { (selectedBand === "Grove Street") &&<img src={gs} alt='gs' /> }
                </div>
                <div className='select_name'>
                    <h2>Grove Street</h2>
                </div>
            </div>
            <div onClick={() => setSelectedBand("Vagos")} className='select_block vagos'>
                <div className='select_avatar vagos'>
                    { (selectedBand === "Vagos") &&<img src={vagos} alt='vagos' /> }
                </div>
                <div className='select_name'>
                    <h2>Vagos</h2>
                </div>
            </div>
            <div onClick={() => setSelectedBand("Atztek")} className='select_block atztek'>
                <div className='select_avatar atztek'>
                    { (selectedBand === "Atztek") &&<img src={atztek} alt='atztek' /> }
                </div>
                <div className='select_name'>
                    <h2>Atztek</h2>
                </div>
            </div>
        </div>
        <div onClick={onConfirmClick} id='select_button'>
            <h3>Confirm</h3>
        </div>
    </div>
  )
}

export default SelectBand