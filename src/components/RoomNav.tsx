import { Dispatch, SetStateAction, useRef } from 'react'

interface RoomNavProps {
  interfaceSelected: string
  setInterfaceSelected: Dispatch<SetStateAction<string>>
}

export default function RoomNav({setInterfaceSelected}: RoomNavProps) {


  const messageRef = useRef<HTMLDivElement>(null)
  const requestsRef = useRef<HTMLDivElement>(null)

  function selectMessages() {
    if (!messageRef.current || !requestsRef.current) return
    
    messageRef.current.style.backgroundColor = 'green'
    requestsRef.current.style.backgroundColor = '#072b3b'
    setInterfaceSelected('messages')
  }

  function selectRequests() {
    if (!messageRef.current || !requestsRef.current) return

    messageRef.current.style.backgroundColor = '#072b3b'
    requestsRef.current.style.backgroundColor = 'green'
    setInterfaceSelected('requests')
  }

  return (
    <div className='bg-mySecondary flex flex-row rounded-sm font-semibold'>
      <div className='basis-1/2 text-center transition-all duration-100'
        style={{backgroundColor: 'green'}}
        ref={messageRef}
        onClick={selectMessages}
      >
        messages
      </div>
      <div className='basis-1/2 text-center transition-all duration-100'
        ref={requestsRef}
        onClick={selectRequests}
      >
        requests
      </div>
    </div>
  )
}
