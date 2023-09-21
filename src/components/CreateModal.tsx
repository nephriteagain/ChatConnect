
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
    <div className='fixed top-0 left-0 w-[100vw] h-[100vh] bg-[transparent] flex items-center justify-center'>
      <div className='fixed top-0 left-0 w-[100vw] h-[100vh] bg-black opacity-60 z-[100]'></div>
      <div className='mb-[10%] z-[101] bg-mySecondary p-8 rounded-md w-[450px] min-w-[300px] flex flex-col items-center justify-center'>
        <div className='flex flex-col items-center justify-center mb-4  '>
          <label className='text-lg font-semibold'>Room Name</label>
          <input 
            onChange={(e) => changeName(e)}
            className='px-2 py-1 text-mySecondary outline-none rounded-md'
            type='text' 
            placeholder='enter room name...'
            value={roomData.name}
            maxLength={20}
          />
        </div>
        <div className='bg-myAccent px-4 py-2 rounded-md'>
          <p className='text-lg font-semibold text-center text-black'>
            TYPE
          </p>
          <button ref={publicRef}
            onClick={(e) => setType(e)}
            style={{border: '2px solid #fff'}}
            className='px-2 py-1 mt-1 bg-myBackground mx-1 rounded-md'
          >
            Public
          </button>
          <button ref={privateRef}
            onClick={(e) => setType(e)}
            className='px-2 py-1 mt-1 bg-myBackground mx-1 rounded-md'
          >
            Private
          </button>
        </div>

        <div className='bg-myPrimary text-mySecondary font-bold flex w-[280px] px-4 py-2 rounded-md my-4'>
          <button onClick={() => handleCreate(roomData)}
          className='basis-1/2 bg-green-300 rounded-md mx-1 px-2 py-1'
          >
            Create Room
          </button>
          <button onClick={() => handleModal(false)}
          className='basis-1/2 bg-red-300 rounded-md mx-1 px-2 py-1'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
