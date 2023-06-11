import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore'
import { db } from '../db/firebase'

import { AiFillCloseSquare, AiFillCheckSquare } from 'react-icons/ai'

import type { requestType } from "./JoinedRoom"

interface RequestsProps {
  requests: requestType[]
  isAdmin: boolean
  isMod: boolean
  joinedRoomId: string|null
}

export default function Requests({
  requests, 
  isAdmin, 
  isMod, 
  joinedRoomId
}: RequestsProps) {

  async function approveJoinRequest(request: requestType) {
    if (!joinedRoomId) return
    const roomRef = doc(db, 'rooms', joinedRoomId)
    
    await updateDoc(roomRef, {
      members: arrayUnion(request),
      requests: arrayRemove(request)
    })
      .catch(err => {
        throw new Error(err)
      })    
  }

  async function rejectJoinRequest(request: requestType) {
    if (!joinedRoomId) return
    const roomRef = doc(db, 'rooms', joinedRoomId)

    await updateDoc(roomRef, {
      requests: arrayRemove(request)
    })
      .catch(err => {
        throw new Error(err)
      })
  }


  return (
    <div>
      {requests.map((req, index) => {
        return (
          <div key={index} className="bg-mySecondary mx-4 text-myText px-4 py-2 rounded-md flex"
          >
            <div className='me-auto'>
              <p>
                {req.userName}
              </p>
              <small className="text-[0.6rem] opacity-80">
                {req.id}
              </small>
            </div>
            { (isAdmin || isMod) &&
              <div className='flex text-4xl'>
              <button className='mx-1 hover:scale-110 active:scale-100 transition-all duration-100'
                onClick={() => approveJoinRequest(req)}
              >
                <AiFillCheckSquare className='fill-green-300'/>
              </button>
              <button className='mx-1 hover:scale-110 active:scale-100 transition-all duration-100'
                onClick={() => rejectJoinRequest(req)}
              >
                <AiFillCloseSquare className='fill-red-300'/>
              </button>
            </div>
            }
            
          </div>
        )
      })}
      </div>
  )
}
