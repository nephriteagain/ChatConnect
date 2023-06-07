import { useState, useEffect, Dispatch, SetStateAction } from "react"

import { collection, getDocs, onSnapshot } from "firebase/firestore"
import { db } from "../db/firebase"


// TODO add right type here
export type roomType = {
  admin: string
  type: string
  mods: string[]
  name: string
  messages: any[] //tbd
  id: string
}

interface RoomsProps {
  setJoinedRoomId: Dispatch<SetStateAction<string|null>>
}

export default function Rooms({setJoinedRoomId}: RoomsProps) {
  const [ rooms, setRooms ] = useState<roomType[]>([])

  const roomsRef = collection(db, 'rooms')
  
  useEffect(() => {
    const unsub = onSnapshot(roomsRef, (querySnapshot) => {
      const roomList : roomType[] = []
      querySnapshot.forEach((doc) => {        
        roomList.push({...doc.data(), id: doc.id} as roomType)
      })
      setRooms(roomList)
    })   
    return () => unsub()
  }, [])

  return (
    <div>
      {rooms.map((room) => {
        return (
          <div key={room.id}
            className=" bg-myAccent px-2 py-2 my-1 rounded-md shadow-sm w-[200px] max-w-[200px] flex items-center justify-center"
          >
            <span className="me-auto">
              {room.name}
            </span>
            {
            room.type === 'public' && 
            <button onClick={() => setJoinedRoomId(room.id)}
              className="bg-mySecondary px-2 py-1 rounded-md"
            >
              Enter
            </button>
            }
          </div>
        )
      })}
    </div>
  )
}
