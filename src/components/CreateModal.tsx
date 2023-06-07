import { limit } from 'firebase/firestore'
import {useState, useRef, ChangeEvent, MouseEvent, Dispatch, SetStateAction} from 'react'

interface CreateModalProps  {
  handleCreate: (roomData: roomData) => void
  handleModal: Dispatch<SetStateAction<boolean>>
}

type roomData = {
  name: string
  type: string
}

export default function CreateModal({handleCreate, handleModal} : CreateModalProps) {
  const [ roomData, setRoomData ] = useState<roomData>({name: '', type: 'public'})


  const publicRef = useRef<HTMLButtonElement>(null)
  const privateRef = useRef<HTMLButtonElement>(null)

  function changeName(e: ChangeEvent<HTMLInputElement>) {
    if (!e.currentTarget ) return
    const value = e.currentTarget.value
    setRoomData({...roomData, name: value})
  }

  
  function setType(e: MouseEvent<HTMLButtonElement>) {
    if (!publicRef.current || !privateRef.current) return
    const publicDiv = publicRef.current
    const privateDiv = privateRef.current

    if (e.currentTarget === publicDiv) {
      setRoomData({...roomData, type: 'public'})
      publicDiv.style.border = '2px solid #fff'
      privateDiv.style.border = '2px solid transparent'
    } else {
      setRoomData({...roomData, type: 'private'})
      publicDiv.style.border = '2px solid transparent'
      privateDiv.style.border = '2px solid #fff'
    }
  }
  

  


  return (
    <div className='fixed top-0 left-0 w-full h-full bg-[transparent] flex items-center justify-center'>
      <div className='mb-[10%]'>
        <div>
          <label>Room Name</label>
          <input 
            onChange={(e) => changeName(e)}
            className='px-2 text-mySecondary'
            type='text' 
            placeholder='enter room name...'
            value={roomData.name}
          />
        </div>
        <div>
          <button ref={publicRef}
            onClick={(e) => setType(e)}
            style={{border: '2px solid #fff'}}
          >
            Public
          </button>
          <button ref={privateRef}
            onClick={(e) => setType(e)}
          >
            Private
          </button>
        </div>

        <div>
          <button onClick={() => handleCreate(roomData)}>
            Create New Room
          </button>
          <button onClick={() => handleModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
