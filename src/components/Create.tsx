import { useState } from "react"
import { addDoc, collection, doc, updateDoc, arrayUnion } from "firebase/firestore"
import { auth, db, } from "../db/firebase"

import CreateModal from "./CreateModal"

interface newRoom {
  name: string
  type: string
}

export default function Create() {
  const [ showModal, setShowModal ] = useState<boolean>(false)
  

  async function createNewRoom({name, type}: newRoom) {
    if (auth.currentUser === null) return
    if (!name || !type) return

    const roomsRef = collection(db, 'rooms')
    const data = type === 'public'
      ? {
        admin: auth.currentUser.uid,
        mods: [],
        messages: [],
        name,
        type,     
      }
      : {
        admin: auth.currentUser.uid,
        mods: [],
        messages: [],
        name,
        type,
        members: [auth.currentUser.uid]
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
      <button onClick={() => setShowModal(true)}>
        Create New Room
      </button>
    </div>
  )
}
