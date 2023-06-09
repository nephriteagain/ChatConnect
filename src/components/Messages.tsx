import { useState, MouseEvent } from 'react'

import { auth, db } from "../db/firebase"
import { updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore'

import ModPopup from "./ModPopup"
import DeleteTextPopup from './DeleteTextPopup'

import type { message } from "./JoinedRoom"

interface MessagesProps {
  messages: message[]
  user: any //TODO
  isAdmin: boolean
  modList: string[]
  joinedRoomId: string|null
  isMod: boolean
}




export default function Messages({messages, user, isAdmin, isMod ,modList, joinedRoomId}: MessagesProps) {


  async function promoteUserToMod(e: MouseEvent<HTMLButtonElement>, userId: string, roomId: string,) {
    
    e.preventDefault()
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

  async function deleteMessage(message: message, roomId: string) {
    if (typeof roomId !== 'string') return

    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, {
      messages: arrayRemove(message)
    })
      .then(() => alert(`message ${message.id} deleted successfully`))
      .catch(err => {
        throw new Error(err)
      })
  }

  function showPopup(e: MouseEvent<HTMLElement>, index: number) {
    e.stopPropagation()

    const popupElement = document.querySelector(`.popup-${index}`) as HTMLDivElement
    if (popupElement) {
      popupElement.classList.remove('popup-hide')
      popupElement.classList.add('popup-show')
      console.log(popupElement.classList)
    }
  }

  function showDeleteTextPopup(e: MouseEvent<HTMLDivElement>, index: number) {
    e.stopPropagation()

    const element = document.querySelector(`.delete-${index}`) as HTMLDivElement
    if (element) {
      element.style.transform = 'translateX(0%)'
    }
  }


  return (
    <>
    {messages.map((message, index) => {
      const isUserMod = modList.some((mod) => mod === message?.userId)      
      const isUserPost = user?.uid === message?.userId
      
    return (
    <div key={index} className='flex flex-col mb-3 mt-1 relative'>
      {
      (isAdmin || isMod || isUserPost) ?
      <div onClick={(e) => showDeleteTextPopup(e, index)}
      className={isUserPost ?
        'max-w-[80%] ms-auto px-2 py-1 bg-myAccent rounded-md  text-myText overflow-x-clip cursor-pointer' : 
        'max-w-[80%] me-auto px-2 py-1 bg-myAccent rounded-md  text-myText overflow-x-clip cursor-pointer'
      }
      >
      { isUserPost ? 
      <DeleteTextPopup 
        position='right' 
        index={index} 
        deleteMessage={deleteMessage}
        message={message}
        roomId={joinedRoomId}
      /> : 
      <DeleteTextPopup 
        position='left' 
        index={index} 
        deleteMessage={deleteMessage}
        message={message}
        roomId={joinedRoomId}
      />}
      {message.text}
      </div> :
      <div 
      className={isUserPost ?
        'max-w-[80%] ms-auto px-2 py-1 bg-myAccent rounded-md  text-myText overflow-x-clip' : 
        'max-w-[80%] me-auto px-2 py-1 bg-myAccent rounded-md  text-myText overflow-x-clip'
      }
      >
      {message.text}
      </div>
      }
      

      {/* user is an admin, messageUserId is not a mod,  messageUserId is not from self*/}
      { (isAdmin && !isUserMod && !isUserPost) ?
      <small onClick={(e) => showPopup(e, index)}
        className={isUserPost ?
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
      <small className={isUserPost ?      
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
