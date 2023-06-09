import { MouseEvent,} from 'react'
import { AiFillCloseSquare, AiFillCheckSquare } from 'react-icons/ai'

interface ModPopupProps {
  
  promoteUserToMod: (e: MouseEvent<HTMLButtonElement> ,userId: string, joinedRoomId: string,) => void
  joinedRoomId: string|null
  userId: string
  index: number
}

export default function ModPopup({promoteUserToMod, joinedRoomId, userId, index, }: ModPopupProps) {    
  

  function hidePopup(e: MouseEvent<HTMLButtonElement>, index: number) {    
    e.stopPropagation()

    const el = document.querySelector(`.popup-${index}`) as HTMLDivElement
    if (el) {
      el.classList.remove('popup-show')
      el.classList.add('popup-hide')

    }
  
  }

  return (
    <div className={`popup-${index} popup-hide bg-mySecondary text-myText px-1 py-[1px] rounded-md w-fit flex items-center justify-center text-md absolute top-100 left-0 overflow-hidden z-[9] transition-all duration-100`}    
    >
      <span>
        mod user?
      </span>
      <button onClick={(e) => promoteUserToMod(e, userId, joinedRoomId as string)}        
        className='w-fit h-fit'
      >
        <AiFillCheckSquare className="fill-green-400 text-2xl mx-1"/>
      </button>
      <button onClick={(e) => hidePopup(e,index)}
        className='w-fit h-fit'
      >        
        <AiFillCloseSquare className="fill-red-400 text-2xl"/>
      </button>
    </div>
  )
}

