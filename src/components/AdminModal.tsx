import { Dispatch, SetStateAction, MouseEvent, useEffect, useState } from 'react'

import {doc, getDoc} from 'firebase/firestore'

import { db } from '../db/firebase'

interface AdminModalType {
  joinedRoomId: string|null
  setShowAdminModal: Dispatch<SetStateAction<boolean>>
  isAdmin: boolean
  isMod: boolean
}

interface userType {
  email: string
  id: string
  joinedAt: number
  name: string
  userName: string
}

export default function AdminModal({joinedRoomId, setShowAdminModal, isAdmin, isMod}: AdminModalType) {
  const [ modsData, setModsData ] = useState<userType[]>([])
  const [ adminData, setAdminData ] = useState<userType|null>(null)

  function closeModal(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    setShowAdminModal(false)
  }

  useEffect(() => {
    if (!joinedRoomId) return
    const modDataArr : userType[] = []

    const roomRef = doc(db, 'rooms', joinedRoomId)
    getDoc(roomRef)
      .then(document => {
        if (document?.data()) {
          const admin : string = document?.data()?.admin
          const modsArr : string[] = document?.data()?.mods
          console.log(modsArr, 'modsArr from getDoc')
          if (admin) {
            const adminRef = doc(db, 'users', admin)
            getDoc(adminRef)
              .then((doc) => {
                if (doc?.data()) {
                  const data = doc.data() as userType
                  setAdminData(data)
                }
              })
          }
          if (modsArr.length > 0) {
            modsArr.forEach(mod => {
              const modRef = doc(db, 'users', mod)
              getDoc(modRef)
                .then((document) => {
                  if (document?.data()) {
                    const data = document.data() as userType
                    modDataArr.push(data)
                  }
                })
                .finally(() => setModsData(modDataArr))                
            })            
          }
        }
      })
      .catch(err => {
        throw new Error(err)
      })
  }, [joinedRoomId])

  useEffect(() => {
    console.log(modsData, 'modsData')
  }, [modsData])

  return (
    <div className="fixed top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center z-[500]">
      <div className="fixed top-0 left-0 h-full w-full bg-myBackground opacity-80 z-[501]"
        onClick={(e) => closeModal(e)}
      />      
      <div className="px-3 py-4 mx-3 z-[502] w-[500px] min-w-[300px] max-h-[400px] min-h-[400px] bg-myPrimary rounded">
        <div className='flex flex-col items-center justify-center bg-mySecondary px-2 py-2 rounded-md mb-8'>
          <p className='font-bold text-2xl'>ADMIN</p>
          <div className='font-semibold text-xl'>
            {adminData?.userName}
          </div>
          <div className='font-semibold text-sm'>
            {adminData?.id}
          </div>
        </div>
        <div className='flex flex-col items-center justify-center bg-myAccent rounded-md mb-6 px-2 py-2'>
          <p className='font-bold text-xl'>
            MODS
          </p>
          {modsData.map(mod => {            
            return (
              <div key={mod.id}
                className='flex flex-col items-center justify-center bg-myPrimary text-myBackground font-semibold px-4 py-1 rounded-md my-2 shadow-md drop-shadow-md'
              >                
                <div className='text-lg'>
                  {mod?.userName}
                </div>
                <div className='text-sm'>
                  {mod?.id}
                </div>
                {
                  (isAdmin || isMod) &&
                  <>
                    <div className='text-sm'>
                      {mod?.email}
                    </div>
                  </>
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
