import { useState } from "react"
import { addDoc, collection, } from "firebase/firestore"
import { auth, db, } from "../db/firebase"

import CreateModal from "./CreateModal"

type CreateProps = {
  userName: string
}

interface newRoom {
  name: string
  type: string
}

export default function Create({userName}: CreateProps) {
  const [ showModal, setShowModal ] = useState<boolean>(false)
  

  async function createNewRoom({name, type}: newRoom) {
    if (auth.currentUser === null) return
    if (!name || !type) return
    if (name === 'PUBLIC') {
      alert('cannot name a Room as "PUBLIC"')
    }
 

    const roomsRef = collection(db, 'rooms')
    const data = type === 'public'
      ? {
        admin: auth.currentUser.uid,
        mods: [],
        messages: [],
        name,
        type,
        banned: []     
      }
      : {
        admin: auth.currentUser.uid,
        mods: [],
        messages: [],
        name,
        type,
        banned: [],
        members: [{
          id: auth.currentUser.uid,
          email: auth.currentUser.email,
          userName
        }],
        requests: []
      }
    await addDoc(roomsRef, data)
      .then(() => {
        setShowModal(false)
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  
  return (
    <div>
      {showModal &&<CreateModal handleCreate={createNewRoom} handleModal={setShowModal}/>}
      <button onClick={() => setShowModal(true)}
        className="mb-6 text-lg bg-green-700 px-2 py-1 rounded-md font-bold hover:bg-green-500 hover:text-myBackground hover:scale-105 transition-all duration-200"
      >
        Create New Room
      </button>
    </div>
  )
}
