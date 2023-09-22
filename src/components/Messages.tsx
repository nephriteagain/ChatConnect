import { MouseEvent } from 'react'

import { db } from "../db/firebase"
import { updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore'

import ModPopup from "./ModPopup"
import DeleteTextPopup from './DeleteTextPopup'
import BanUserPopup from './BanUserPopup'

import { filterPhrase } from '../lib/data'

import type { message } from "./JoinedRoom"


interface MessagesProps {
  messages: message[]
  user: any //TODO
  isAdmin: boolean
  modList: string[]
  joinedRoomId: string|null
  isMod: boolean
  adminId: string
  customCensoredWords: string[]
}

type callback = (e: MouseEvent<HTMLButtonElement>) => void

// need for clearInterval function on a separate function
let timeout : any;


export default function Messages({
  messages, 
  user, 
  isAdmin, 
  isMod ,
  modList, 
  joinedRoomId, 
  adminId,
  customCensoredWords
}: MessagesProps) {


  function showBanPopupElement(e: MouseEvent<HTMLElement>, messageId: string) {
    e.stopPropagation()
    timeout = setTimeout(() => {      
      const element = document.querySelector(`.ban-${messageId}`) as HTMLDivElement
      element.style.transform = 'translateX(0%)'
      clearInterval(timeout)
    },1000)
  }

  function hideBanPopupElement(e: MouseEvent<HTMLElement>, messageId: string, isUserPost: boolean) {
    e.stopPropagation()    
    const hideInterval = setTimeout(() => {
      const element = document.querySelector(`.ban-${messageId}`) as HTMLDivElement      
      element.style.transform = isUserPost ? 'translateX(300%)' : 'translateX(-300%)'
      clearInterval(hideInterval)
    }, 500)
    clearInterval(timeout)

  }


  async function promoteUserToMod(e: MouseEvent<HTMLButtonElement>, userId: string, roomId: string,) {
    
    e.preventDefault()
    if (typeof roomId !== 'string') return
    const roomRef = doc(db, 'rooms', roomId)

    try {
      await updateDoc(roomRef, {
        mods: arrayUnion(userId)
      })
      alert(`user "${userId}" successfully modded`)  

    } catch (error) {
      console.error(error)
    }

  }

  async function deleteMessage(e: MouseEvent<HTMLButtonElement> , message: message, roomId: string, cb: callback) {
    if (typeof roomId !== 'string') return

    const roomRef = doc(db, 'rooms', roomId)

    try {
      await updateDoc(roomRef, {
        messages: arrayRemove(message)
      })
      cb(e)       

    } catch (error) {
      console.error(error)
    }

  }

  function showPopup(e: MouseEvent<HTMLElement>, index: number) {
    e.stopPropagation()


    const popupElement = document.querySelector(`.popup-${index}`) as HTMLDivElement
    if (popupElement) {
      popupElement.classList.remove('popup-hide')
      popupElement.classList.add('popup-show')

    }
  }

  function showDeleteTextPopup(e: MouseEvent<HTMLDivElement>, index: number) {
    e.stopPropagation()

    const element = document.querySelector(`.delete-${index}`) as HTMLDivElement
    if (element) {
      element.style.transform = 'translateX(0%)'
    }
  }

  function customFilter(phrase: string) {
    if (customCensoredWords.length === 0) {
      return phrase
    }

    const wordsArr = phrase.split(' ')
    const filteredArr = wordsArr.map(word => {
      const censor = '*'
      const isBadWord = customCensoredWords.some(customWord => customWord === word)
      if (isBadWord) {
        return censor.repeat(word.length)
      }
      return word
    })    
    const filteredPhrase =  filteredArr.join(' ')
    return filteredPhrase
  }

  

  return (
    <>
    {messages.map((message, index) => {
      const isUserMod = modList.some((mod) => mod === message?.userId)      
      const isUserPost = user?.uid === message?.userId    
      const isUserAdmin = message.userId === adminId
      
      const filteredText = customFilter(filterPhrase(message.text))
      const filterName = customFilter(filterPhrase(message.userName))

    return (
    <div key={message.id} className='flex flex-col mb-3 mt-1 relative'>
      {
      (isAdmin || isMod || isUserPost) ?
      <div onClick={(e) => showDeleteTextPopup(e, index)}
      className={isUserPost ?
        'max-w-[80%] ms-auto px-2 py-1 bg-transparent border-[3px] border-myAccent rounded-xl  text-myText overflow-x-clip cursor-pointer' : 
        'max-w-[80%] me-auto px-2 py-1 bg-transparent border-[3px] border-myAccent rounded-xl  text-myText overflow-x-clip cursor-pointer'
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
      {filteredText}
      </div> :
      <div 
      className={isUserPost ?
        'max-w-[80%] ms-auto px-2 py-1 bg-transparent border-[3px] border-myAccent rounded-xl  text-myText overflow-x-clip' : 
        'max-w-[80%] me-auto px-2 py-1 bg-transparent border-[3px] border-myAccent  rounded-xl  text-myText overflow-x-clip'
      }
      >
      {filteredText}
      </div>
      }
      

      {/* user is an admin, messageUserId is not a mod,  messageUserId is not from self*/}
      { (isAdmin && !isUserMod && !isUserPost) ?
      <small onClick={(e) => showPopup(e, index)}
        className={isUserPost ?
          'opacity-55 ms-auto cursor-pointer relative text-myText':
          'opacity-55 me-auto cursor-pointer relative text-myText'          
        }
        onMouseEnter={(e) => showBanPopupElement(e, message.id)}                
        onMouseLeave={(e) => hideBanPopupElement(e, message.id, isUserPost)}
      >
        {filterName}        
          <ModPopup 
          promoteUserToMod={promoteUserToMod} 
          userId={message?.userId}
          joinedRoomId={joinedRoomId}
          index={index}
        />
          <BanUserPopup 
            position={isUserPost? 'right': 'left'} 
            messageId={message.id}
            joinedRoomId={joinedRoomId}
            userId={message.userId}
          />
      </small> :
      // cant show the ban popup if the message post belongs to
      // an admin, a mod or yourself,
      // and you must be a mod
      (!isUserAdmin && !isUserMod && !isUserPost && isMod) ?
      <small
        className={isUserPost ?
          'opacity-55 ms-auto cursor-pointer relative':
          'opacity-55 me-auto cursor-pointer relative'          
        }
        onMouseEnter={(e) => showBanPopupElement(e, message.id)}                
        onMouseLeave={(e) => hideBanPopupElement(e, message.id, isUserPost)}
      >
        
        {filterName}  
        <BanUserPopup 
            position={isUserPost? 'right': 'left'} 
            messageId={message.id}
            joinedRoomId={joinedRoomId}
            userId={message.userId}
          />
      </small> :
      <small className={isUserPost ?      
        'opacity-55 ms-auto relative text-myText':
        'opacity-55 me-auto relative text-myText'
      }                  
      >
        {filterName}
        
      </small>
      }
    </div>
    )
  })}
    </>
  )
}
