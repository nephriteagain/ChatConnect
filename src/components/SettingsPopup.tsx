import { useState, MouseEvent, Dispatch, SetStateAction } from 'react'

import { doc, updateDoc, arrayRemove, getDoc, arrayUnion, writeBatch } from 'firebase/firestore'
import { db } from '../db/firebase'

import { AiFillCloseSquare, AiFillCheckSquare } from 'react-icons/ai'

import type { userType } from './AdminModal'

interface SettingsPopupProps {
  id: string
  joinedRoomId : string|null
  setModsData: Dispatch<SetStateAction<userType[]>>
  setAdminData: Dispatch<SetStateAction<userType|null>>
  adminData: userType|null
}

export default function SettingsPopup({id, joinedRoomId, setModsData, setAdminData, adminData}: SettingsPopupProps) {
  const [ showUnModConfirmation, setShowUnModConfirmation ] = useState<boolean>(false)
  const [ showPromoteToAdminConfirmation, setShowPromoteToAdminConfirmation ] = useState<boolean>(false)

  function cancelUnMod(e: MouseEvent<HTMLSpanElement>) {
    e.stopPropagation()
    setShowUnModConfirmation(false)
  }

  function cancelPromote(e: MouseEvent<HTMLSpanElement>) {
    e.stopPropagation()
    setShowPromoteToAdminConfirmation(false)
  }
  

  function openCloseModConfirmation(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    if (showUnModConfirmation) {
      setShowUnModConfirmation(false)
    } else {
      setShowUnModConfirmation(true)
    }
  }

  function openCloseAdminConfirmation(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    if (showPromoteToAdminConfirmation) {
      setShowPromoteToAdminConfirmation(false)
    } else {
      setShowPromoteToAdminConfirmation(true)
    }
  }

  async function confirmUnMod(e: MouseEvent<HTMLSpanElement>, modId: string, roomId: string) {
    e.stopPropagation()
    if (typeof roomId !== 'string') return

    const roomRef = doc(db, 'rooms', roomId)

    await updateDoc(roomRef, {
      mods: arrayRemove(modId)
    })
      .then(() => {
        setShowUnModConfirmation(false)
        const element = document.querySelector(`.settings-${modId}`) as HTMLButtonElement
        if (element) {
          element.style.visibility = 'hidden'
          element.style.opacity = 'opacity'
        }
      })
      .then(async () => {
        const roomRef = doc(db, 'rooms', roomId)
        const modDataArr : userType[] = []

        await getDoc(roomRef)
          .then((document) => {
            if (document?.data()) {
              const modsArr = document?.data()?.mods as string[]
              if (modsArr.length === 0) {
                setModsData([])
              } else {
                modsArr.forEach((mod) => {
                  const modRef = doc(db, 'users', mod)

                  getDoc(modRef)
                    .then(data => {
                      if (data?.data()) {
                        const modData = data.data() as userType
                        modDataArr.push(modData)
                      }
                    })
                    .finally(() => setModsData(modDataArr))
                })
              }
              
            }
          })
      })
      .catch(err => {
        throw new Error(err)
      })

  }

  async function confirmPromote(e: MouseEvent<HTMLSpanElement>, modId: string, roomId: string, adminId: string) {
    e.stopPropagation()
    if (typeof roomId !== 'string') return
    if (typeof adminId !== 'string') return

    const roomRef = doc(db, 'rooms', roomId)
    const batch = writeBatch(db)

    const modDataArr : userType[] = []
    let newAdmin : userType;

    batch.update(roomRef, {
      mods: arrayRemove(modId)
    })
    batch.update(roomRef, {
      mods: arrayUnion(adminId),
      admin: modId
    })
    
    await batch.commit()
      .then(async () => {
        await getDoc(roomRef)
          .then(document => {
            if (document?.data()) {
              // fetch new mods arr
              const modsArr = document.data()?.mods as string[]              
              if (modDataArr.length === 0) {
                setModsData([])
              } else {
                modsArr.forEach(mod => {
                  const modRef = doc(db, 'users', mod)

                  getDoc(modRef)
                    .then(data => {
                      if (data?.data()) {
                        const modData = data.data() as userType
                        modDataArr.push(modData)
                      }
                    })                    
                })
              }
            }
            // fetch new admin data
            const newAdminId = document?.data()?.admin as string
            if (newAdminId) {
              const adminRef = doc(db, 'users', newAdminId)
              getDoc(adminRef)
                .then(data => {
                  if (data.data()) {
                    newAdmin = data.data() as userType
                  }
                })
                .finally(() => setAdminData(newAdmin))

            }
          })
          .finally(() => setModsData(modDataArr))
      })
      .catch(err => {
        throw new Error(err)
      })
  }

  return (
    <div className={`settings-${id} absolute top-[40%] right-2 z-10 max-w-[200px] bg-myBackground text-myText px-2 py-1 rounded-md transition-all duration-150`}
      style={{visibility: 'hidden'}}
    >
      <div className='text-center bg-mySecondary px-2 py-[2px] rounded-md my-[0.1rem] hover:bg-red-700 hover:scale-x-105 active:scale-x-100 transition-all duration-100 cursor-pointer'
        onClick={(e) => openCloseModConfirmation(e)}
      >
        remove mod
      </div>
      { showUnModConfirmation &&
        <div className='flex flex-row items-center justify-center my-1'>
        <span className='text-2xl mx-1 cursor-pointer'
          onClick={(e) => confirmUnMod(e, id, joinedRoomId as string)}
        >
          <AiFillCheckSquare className='fill-red-400 hover:scale-105 active:scale-100 transition-all duration-100' />
        </span>
        <span className='text-2xl mx-1 cursor-pointer'          
          onClick={(e) => cancelUnMod(e)}
        >
          <AiFillCloseSquare className='fill-green-400 hover:scale-105 active:scale-100 transition-all duration-100' />
        </span>
      </div>
      }
      <div className='text-center bg-mySecondary px-2 py-[2px] rounded-md my-[0.1rem] hover:bg-orange-700 hover:scale-x-105 active:scale-x-100 transition-all duration-100 cursor-pointer'
        onClick={(e) => openCloseAdminConfirmation(e)}
      >
        promote to admin
      </div>
      { showPromoteToAdminConfirmation &&  
      <div>
        <p className='text-center'>
          <span className='text-red-400'>warning: </span>this action cannot be undone
        </p>
        <div className='flex flex-row items-center justify-center my-1'>
          <span className='text-2xl mx-1 cursor-pointer'
            onClick={(e) => confirmPromote(e, id, joinedRoomId as string, adminData?.id as string)}        
          >
            <AiFillCheckSquare className='fill-red-400 hover:scale-105 active:scale-100 transition-all duration-100' />
          </span>
          <span className='text-2xl mx-1 cursor-pointer'                  
            onClick={(e) => cancelPromote(e)}
          >
            <AiFillCloseSquare className='fill-green-400 hover:scale-105 active:scale-100 transition-all duration-100' />
          </span>
        </div>
      </div>
      }
    </div>
  )
}
