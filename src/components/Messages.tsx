import { useState, MouseEvent } from 'react'

import { auth, db } from "../db/firebase"
import { updateDoc, doc, arrayUnion } from 'firebase/firestore'

import ModPopup from "./ModPopup"

import type { message } from "./JoinedRoom"

interface MessagesProps {
  messages: message[]
  user: any //TODO
  isAdmin: boolean
  modList: string[]
  joinedRoomId: string|null
}




export default function Messages({messages, user, isAdmin, modList, joinedRoomId}: MessagesProps) {


  async function promoteUserToMod(e: MouseEvent<HTMLButtonElement>, userId: string, roomId: string,) {
    if (typeof roomId !== 'string') return
    const roomRef = doc(db, 'rooms', roomId)

    await updateDoc(roomRef, {
      mods: arrayUnion(userId)
    })
      .then(() => {
        alert(`user "${userId}" successfully modded`)  
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  function showPopup(index: number) {
    const popupElement = document.querySelector(`.popup-${index}`) as HTMLDivElement
    if (popupElement) {
      popupElement.classList.remove('popup-hide')
      popupElement.classList.add('popup-show')
      console.log(popupElement.classList)
    }
  }


  return (
    <>
    {messages.map((message, index) => {
    return (
    <div key={index} className='flex flex-col mb-3 mt-1 relative'>
      <div className={message.userId === user?.uid ?
        'max-w-[80%] ms-auto px-2 py-1 bg-myAccent rounded-md  text-myText overflow-x-clip' : 
        'max-w-[80%] me-auto px-2 py-1 bg-myAccent rounded-md  text-myText overflow-x-clip'
      }
      >
        {message.text}
      </div>
      {/* user is an admin, messageUserId is not a mod,  messageUserId is not from self*/}
      { (isAdmin && (!modList?.some((mod) => mod === message?.userId)  && user?.uid !== message?.userId)) ?
      <small onClick={() => showPopup(index)}
        className={message.userId === user?.uid ?
          'opacity-55 ms-auto cursor-pointer':
          'opacity-55 me-auto cursor-pointer'
        }
      >
        {message?.userName}        
          <ModPopup 
          promoteUserToMod={promoteUserToMod} 
          userId={message?.userId}
          joinedRoomId={joinedRoomId}
          index={index}
        />
        
      </small> :
      <small className={message.userId === user?.uid ?      
        'opacity-55 ms-auto':
        'opacity-55 me-auto'
      }>
        {message?.userName}
      </small>
      }
    </div>
    )
  })}
    </>
  )
}
