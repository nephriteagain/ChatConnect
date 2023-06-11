import { MouseEvent } from 'react'


import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../db/firebase'

import { AiFillCloseSquare, AiFillCheckSquare } from 'react-icons/ai'

interface BanUserPopupProps {
  position: string
  messageId: string
  joinedRoomId: string|null
  userId: string
}



export default function BanUserPopup({
  position, 
  messageId, 
  joinedRoomId, 
  userId
}: BanUserPopupProps) {


  function hideBanPopup(e: MouseEvent<HTMLButtonElement>, messageId: string, position: string) {
    e.stopPropagation()
    const element = document.querySelector(`.ban-${messageId}`) as HTMLDivElement
    element.style.transform = position === 'left' ? 'translateX(-300%)' : 'translateX(300%)'
  }

  async function banUser(e: MouseEvent<HTMLButtonElement>, messageId: string, position: string, joinedRoomId: string, userId: string) {
    if (typeof joinedRoomId !== 'string') return

    e.stopPropagation()
    const element = document.querySelector(`.ban-${messageId}`) as HTMLDivElement
    element.style.transform = position === 'left' ? 'translateX(-300%)' : 'translateX(300%)'

    const roomRef = doc(db, 'rooms', joinedRoomId)
    await updateDoc(roomRef, {
      banned: arrayUnion(userId)
    })
      .then(() => alert(`user ${userId} is banned!`))
      .catch(err => {
        throw new Error(err)
      })
  }


  return (
    <div 
    style={position==='left'? {transform: 'translateX(-300%)'}: {transform: 'translateX(300%)'}}
    className={position === 'left' ?
    `ban-${messageId} text-myText flex flex-row items-center justify-center rounded-md px-1 py-[0.12rem] bg-mySecondary absolute left-[105%] top-1 translate-y-[-50%] transition-all duration-300 ease-in-out ` :
    `ban-${messageId} text-myText flex flex-row items-center justify-center rounded-md px-1 py-[0.12rem] bg-mySecondary absolute right-[105%] top-1 translate-y-[-50%] transition-all duration-300 ease-in-out `
    }
    onClick={(e) => e.stopPropagation()} // needed this

    >
      <span className='whitespace-nowrap'>ban user?</span>
      <button
        className='w-fit h-fit hover:scale-110 active:scale-100 transition-all duration-100'
        onClick={(e) => banUser(e, messageId, position, joinedRoomId as string, userId)}
      >
        <AiFillCheckSquare className="fill-green-400 text-2xl mx-1"/>
      </button>
      <button
        className='w-fit h-fit hover:scale-110 active:scale-100 transition-all duration-100'
        onClick={(e) => hideBanPopup(e, messageId, position)}
      >        
        <AiFillCloseSquare className="fill-red-400 text-2xl"/>
      </button>
    </div>
  )
}
