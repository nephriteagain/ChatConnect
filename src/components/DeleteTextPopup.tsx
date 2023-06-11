import { MouseEvent } from 'react'

import { AiFillCloseSquare, AiFillCheckSquare } from 'react-icons/ai'

import type { message } from './JoinedRoom'

interface DeleteTextPopupProps {
  position: string
  index: number
  message: message
  roomId: string|null
  deleteMessage: (e: MouseEvent<HTMLButtonElement> , message: message, roomId: string, cb: (e: MouseEvent<HTMLButtonElement>) => void) => void

}



export default function DeleteTextPopup({
  position, 
  index, 
  deleteMessage, 
  message, 
  roomId
}: DeleteTextPopupProps) {
  const style : {[key:string]: string} = position === 'left'
    ? { position: 'absolute', top: '100%', left: '0' , transform: 'translateX(-150%)',}
    : { position: 'absolute', top: '100%', right: '0', transform: 'translateX(150%)', }
    

  function hideDeleteTextPopup(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    const element = document.querySelector(`.delete-${index}`) as HTMLDivElement
    if (element) {
      if (position === 'left') {
        element.style.transform = 'translateX(-150%)'
      }
      if (position === 'right') {
        element.style.transform = 'translateX(150%)'
      }
    }
    
  }


  return (
    <div className={`delete-${index} flex flex-row items-center justify-center bg-myBackground px-1 py-1 z-[9] rounded-md text-sm transition-all duration-100`}
      style={style}
    >      
      <span className='flex items-center justify-center'>
        delete message?
        <button onClick={(e) => deleteMessage(e,message, roomId as string, hideDeleteTextPopup)}
          className='w-fit h-fit'>
          <AiFillCheckSquare className="fill-green-400 text-2xl mx-1"/>
        </button>
        <button onClick={(e) => hideDeleteTextPopup(e)}
         className='w-fit h-fit'>
          <AiFillCloseSquare className="fill-red-400 text-2xl mx-1"/>
        </button>
      </span>
    </div>
  )
}
