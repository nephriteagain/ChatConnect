import { Dispatch, SetStateAction, MouseEvent, useEffect, useState } from 'react'

import {doc, getDoc, updateDoc} from 'firebase/firestore'

import { db } from '../db/firebase'

import { IoMdSettings } from 'react-icons/io'
import { AiFillCloseSquare, AiFillCheckSquare } from 'react-icons/ai'
import { motion, } from 'framer-motion'

import SettingsPopup from './SettingsPopup'

interface AdminModalType {
  joinedRoomId: string|null
  setShowAdminModal: Dispatch<SetStateAction<boolean>>
  isAdmin: boolean
  isMod: boolean
  roomName: string
  setRoomName: Dispatch<SetStateAction<string>>
}

export interface userType {
  email: string
  id: string
  joinedAt: number
  name: string
  userName: string
  censoredWords: string[]
}

export default function AdminModal({
  joinedRoomId, 
  setShowAdminModal, 
  isAdmin, 
  isMod, 
  roomName, 
  setRoomName
}: AdminModalType) {
  const [ modsData, setModsData ] = useState<userType[]>([])
  const [ adminData, setAdminData ] = useState<userType|null>(null)  
  const [ newRoomName, setNewRoomName ] = useState<string>('')
  const [ showChangeNameInput, setShowChangeNameInput ] = useState<boolean>(false)

  function closeModal(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    setShowAdminModal(false)
  }


  function openCloseSettings(e: MouseEvent<HTMLButtonElement>, id: string) {
    e.stopPropagation()

    if (typeof id !== 'string') return
    const element = document.querySelector(`.settings-${id}`) as HTMLButtonElement

    if (element) {      
      const styles = window.getComputedStyle(element)
      if (styles.visibility === 'hidden') {
        element.style.visibility = 'visible'
        element.style.opacity = '1'
      } else {
        element.style.visibility = 'hidden'
        element.style.opacity = '0'
      }

    }       
  }

  function showHideChangeNameInput(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    if (!isAdmin) return
    
    if (showChangeNameInput) {
      setShowChangeNameInput(false)
    } else {
      setShowChangeNameInput(true)
    }
  }

  function hideChangeNameInput(e: MouseEvent<HTMLSpanElement>) {
    e.stopPropagation()
    setShowChangeNameInput(false)
  }

  async function changeRoomName(e: MouseEvent<HTMLSpanElement>,joinedRoomId: string, newName: string) {
    e.stopPropagation()

    if (typeof joinedRoomId !== 'string' || !isAdmin || newName.length === 0) return

    const roomRef = doc(db, 'rooms', joinedRoomId)
    try {
      await updateDoc(roomRef, {
        name: newName
      })
      setRoomName(newName)
      setShowChangeNameInput(false)
      setNewRoomName('')
    } catch (error) {
      console.error(error)
    }
  }


  useEffect(() => {
    if (!joinedRoomId) return
    const modDataArr : userType[] = []

    const roomRef = doc(db, 'rooms', joinedRoomId)
    getDoc(roomRef)
      .then(document => {
        if (document?.exists()) {
          const admin : string = document?.data()?.admin
          const modsArr : string[] = document?.data()?.mods

          if (admin) {
            const adminRef = doc(db, 'users', admin)
            getDoc(adminRef)
              .then((doc) => {
                if (doc?.exists()) {
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
                  if (document?.exists()) {
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



  return (
    <div className="fixed top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center z-[500]">
      <motion.div className="fixed top-0 left-0 h-full w-full bg-myBackground opacity-80 z-[501]"
        onClick={(e) => closeModal(e)}
        initial={{opacity: 0}}
        animate={{opacity: 0.8}}
        transition={{duration:0.15}}        
        exit={{opacity: 0}}
      />      
      <motion.div 
        initial={{scale:0.1}}
        animate={{scale: 1}}
        transition={{duration:0.15}}        
        exit={{scale: 0.1}}
        className="flex flex-col px-3 py-4 mx-3 z-[502] w-[400px] min-w-[280px] max-h-[400px] min-h-[400px] bg-mySecondary rounded-md border-4 border-myAccent"
      >
        <motion.div className='mx-auto mb-4 px-4 py-1 bg-myBackground rounded-md flex flex-col items-center justify-center min-w-[220px]'
          layout
        >
          <motion.p className='text-3xl font-bold ' layout>
            {roomName}
          </motion.p>
          { isAdmin &&
          <motion.div className='flex flex-col items-center justify-center mt-2'
            layout
          >
            <motion.button className='text-[0.75rem] font-semibold bg-myAccent text-black rounded-md py-[0.1rem] px-2 my-1 hover:bg-red-200 hover:text-red-800 hover:scale-105 active:scale-100 transition-all duration-100'
              layout
              onClick={(e) => showHideChangeNameInput(e)}
            >
              change name
            </motion.button>
            { showChangeNameInput &&
            <>
            <div className='my-1'>
              <input type='text' maxLength={20}
              className='outline-none text-myBackground ps-3 pe-2 bg-gray-300 rounded text-center'
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.currentTarget.value)}
              />
            </div>
            <div className='flex flex-row items-center justify-center text-3xl'>
              <span className='mx-1 cursor-pointer'
                onClick={(e) => changeRoomName(e, joinedRoomId as string, newRoomName)}
              >
                <AiFillCheckSquare className="fill-red-400 hover:scale-110 active:scale-100 transition-all duration-100" />
              </span>
              <span className='mx-1 cursor-pointer'
                onClick={(e) => hideChangeNameInput(e)}
              >
                <AiFillCloseSquare className="fill-green-400 hover:scale-110 active:scale-100 transition-all duration-100" />
              </span>
            </div>   
            </>    
            }
          </motion.div>
          }
          
        </motion.div>
        <motion.div className='flex flex-col items-center justify-center bg-myBackground px-2 py-2 rounded-md mb-8'
          layout
        >
          <p className='font-bold text-2xl'>ADMIN</p>
          <div className='font-semibold text-xl'>
            {adminData?.userName}
          </div>
          <div className='font-semibold text-sm'>
            {adminData?.id}
          </div>
        </motion.div>
        <motion.div className='flex flex-col items-center justify-center bg-myBackground rounded-md mb-6 px-2 py-2'
          layout
        >
          <p className='font-bold text-xl'>
            MODS
          </p>
          {modsData.length > 0 && modsData.map(mod => {            
            return (
              <div key={mod.id}
                className='flex flex-col items-center justify-center bg-myPrimary text-myBackground font-semibold px-4 py-1 rounded-md my-2 shadow-md drop-shadow-md relative'
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
                { isAdmin && 
                <>
                  <button className='absolute top-1 right-1 text-xl z-10 hover:scale-110 hover:rotate-[90deg] active:scale-100 transition-all duration-100'
                    onClick={(e) => openCloseSettings(e, mod.id)}
                  >
                    <IoMdSettings />
                  </button>
                  <SettingsPopup 
                    id={mod.id} 
                    joinedRoomId={joinedRoomId} 
                    setModsData={setModsData} 
                    setAdminData={setAdminData} 
                    adminData={adminData}
                  />
                  </>
                }
              </div>
            )
          })}
          {modsData.length === 0 &&
            <div>
              There is currently no mods at this room.
            </div>
          }
        </motion.div>
      </motion.div>
    </div>
  )
}
