import { useState, useEffect, Dispatch, SetStateAction } from "react"

import { collection, doc, onSnapshot, updateDoc, arrayUnion, getDoc } from "firebase/firestore"
import { auth, db } from "../db/firebase"


// TODO add right type here
export type roomType = {
  admin: string
  type: string
  mods: string[]
  name: string
  messages: any[] //tbd
  id: string
  members?: string[]
  requests?: any[]
}

interface RoomsProps {
  setJoinedRoomId: Dispatch<SetStateAction<string|null>>
  setShowRooms: Dispatch<SetStateAction<boolean>>
}

export default function Rooms({setJoinedRoomId, setShowRooms}: RoomsProps) {
  const [ rooms, setRooms ] = useState<roomType[]>([])

  const roomsRef = collection(db, 'rooms')

  async function requestJoinRoom(id: string) {
    if (!auth?.currentUser) return

    const userRef = doc(db, 'users', auth.currentUser.uid)
    const data = (await getDoc(userRef)).data()

    if (data) {
      const roomRef = doc(db, 'rooms', id)
    await updateDoc(roomRef, {
      requests: arrayUnion({
        id: auth.currentUser.uid,
        email: data.email,
        userName: data.userName
      })
    })
      .then(() => alert('request sent'))
      .catch(err => {
        throw new Error(err)
      })
    }

    
  }
  
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
            className=" bg-myAccent px-2 py-2 my-2 rounded-md shadow-sm w-[200px] max-w-[200px] flex items-center justify-center"
            style={room.type === 'private' ? {border: '0.2rem solid #000'} : {}}
          >
            <span className="me-auto truncate">
              {room.name}
            </span>
            {
            room.type === 'public' && 
            <button onClick={() => {
              setJoinedRoomId(room.id)
              setShowRooms(false)
            }}
              className="bg-mySecondary px-2 py-1 rounded-md"
            >
              Enter
            </button>
            }
            {
            room.type === 'private' &&
            auth?.currentUser?.uid &&
            !room?.members?.some((member) => member === auth?.currentUser?.uid) &&
            !room?.requests?.some((request) => request?.id === auth?.currentUser?.uid) &&
            <button onClick={() => requestJoinRoom(room.id)}
              className="bg-myBackground px-2 py-1 rounded-md"
            >
              Join
            </button>
            }
            {
            room.type === 'private' &&
            auth?.currentUser?.uid &&
            !room?.members?.some((member) => member === auth?.currentUser?.uid) &&
            room?.requests?.some((request) => request?.id === auth?.currentUser?.uid) &&
            <button disabled
              className="bg-myBackground px-2 py-1 rounded-md disabled:opacity-70"
            >
              Pending
            </button>
            }
            { 
            room.type === 'private' &&
            auth?.currentUser?.uid &&
            room?.members?.some((member) => member === auth?.currentUser?.uid) &&
            <button onClick={() => {
              setJoinedRoomId(room.id)
              setShowRooms(false)
            }}
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
