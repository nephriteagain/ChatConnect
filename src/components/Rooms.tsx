import {  Dispatch, SetStateAction } from "react"

import { collection, doc,  updateDoc, arrayUnion, getDoc } from "firebase/firestore"
import { auth, db } from "../db/firebase"

import { RiGitRepositoryPrivateLine } from 'react-icons/ri'
import { useRoomsSnapshot } from "../hooks/useRoomsSnaphot"

import RoomButton from "./RoomButton"


type member = {
  id: string
  email: string
  userName: string
}

// TODO add right type here
// TODO refactor this abomination of a component
export type roomType = {
  admin: string
  type: string
  mods: string[]
  name: string
  messages: any[] //tbd
  id: string
  banned: string[]
  members?: member[]
  requests?: member[]
}

interface RoomsProps {
  setJoinedRoomId: Dispatch<SetStateAction<string|null>>
  setShowRooms: Dispatch<SetStateAction<boolean>>
}

export default function Rooms({setJoinedRoomId, setShowRooms}: RoomsProps) {
  // const [ rooms, setRooms ] = useState<roomType[]>([])  

  const roomsRef = collection(db, 'rooms')
  const rooms = useRoomsSnapshot<roomType>(roomsRef, [])

  async function requestJoinRoom(id: string) {
    if (!auth?.currentUser) return

    const userRef = doc(db, 'users', auth.currentUser.uid)
    const data = (await getDoc(userRef)).data()

    if (data) {
      const roomRef = doc(db, 'rooms', id)
      try {
        await updateDoc(roomRef, {
          requests: arrayUnion({
            id: auth.currentUser.uid,
            email: data.email,
            userName: data.userName
          })
        })
        alert('request sent')
      } catch (error) {
        console.error(error)
      }
    }

    
  }
  


  return (
    <div>
      {rooms.map((room) => {        
        const isBanned = room.banned.some((id) => id === auth?.currentUser?.uid)
        const isPublic = room.type === 'public' && !isBanned        
        const canJoin = 
          !isBanned &&
          room.type === 'private' &&
          auth?.currentUser?.uid &&
          !room?.members?.some((member) => member?.id === auth?.currentUser?.uid) &&
          !room?.requests?.some((request) => request?.id === auth?.currentUser?.uid)
        const isPending =
          !isBanned &&
          room.type === 'private' &&
          auth?.currentUser?.uid &&
          !room?.members?.some((member) => member?.id === auth?.currentUser?.uid) &&
          room?.requests?.some((request) => request?.id === auth?.currentUser?.uid)
        const isPrivateCanEnter = 
          !isBanned &&
          room.type === 'private' &&
          auth?.currentUser?.uid &&
          room?.members?.some((member) => member?.id === auth?.currentUser?.uid)

        return (
          <div key={room.id}
            className=" bg-myAccent text-black px-2 py-2 my-2 rounded-md shadow-sm w-[200px] max-w-[200px] flex items-center justify-center hover:translate-x-1 transtion-all duration-200"
            >
            {room.type === 'private' && 
              <span className="me-1">
                <RiGitRepositoryPrivateLine />
              </span>
            }
            <span className="me-auto truncate">
              {room.name}
            </span>
            <RoomButton 
              isBanned={isBanned}
              isPending={isPending}
              isPrivateCanEnter={isPrivateCanEnter}
              isPublic={isPublic}
              canJoin={canJoin}
              setJoinedRoomId={setJoinedRoomId}
              roomId={room.id}
              setShowRooms={setShowRooms}
              requestJoinRoom={requestJoinRoom}
            />
            
          </div>
        )
      })}
    </div>
  )
}
