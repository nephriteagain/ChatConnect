import { Dispatch, SetStateAction, useState, ChangeEvent, KeyboardEvent,} from 'react'

import { db } from '../db/firebase'
import {doc, updateDoc} from 'firebase/firestore'
import { motion } from 'framer-motion'

import type { userDataType } from '../App'

import Loading from './Loading'

interface UserModalTypes {
  userName: string
  setUserName: Dispatch<SetStateAction<string>>
  setShowModal: Dispatch<SetStateAction<boolean>>
  userData: userDataType

}

export default function UserModal({
  userName, 
  setUserName, 
  setShowModal, 
  userData
}: UserModalTypes) {
  const [ newName, setNewName ] = useState<string>(userName)
  const [ loading, setLoading ] = useState<boolean>(false)
  
  async function changeUserName() {
    if (!userData?.uid) return
    const userRef = doc(db, 'users', userData.uid)
    try {
      setLoading(true)
      await updateDoc(userRef, {
        userName: newName
      })
      setShowModal(false)
      setUserName(newName)
    } catch (error) {
        console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    e.stopPropagation()
    const value = e.currentTarget.value

    const newValue = value.replace(/\s/g, '') // whitespace not allowed
    setNewName(newValue)
  }

  async function handleSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      await changeUserName()
    }
  }

  return (
    <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center z-20'>
      <motion.div 
        className='fixed top-0 left-0 w-full h-full bg-black opacity-60'
        initial={{opacity: 0}}
        animate={{opacity: 0.6}}
        transition={{duration:0.15}}        
        exit={{opacity: 0}}
      />
      <motion.div 
        initial={{scale:0.1}}
        animate={{scale: 1}}
        transition={{duration:0.15}}        
        exit={{scale: 0.1}}
        className='flex flex-col items-center justify-center z-30 min-w-[300px] border-4 border-mySecondary bg-myAccent px-4 py-4 rounded-md'
      >
        <label className='px-2 py-1 bg-myPrimary  text-myText font-semibold rounded-md my-2 shadow-md drop-shadow-md'>
          New Username
        </label>
        <input type='text' maxLength={20} 
          className='outline-none text-mySecondary px-2 py-1 rounded-md'
          name='name'          
          value={newName}
          onChange={(e) => handleChange(e)}
          onKeyUp={handleSubmit}
        />
        <div className='my-2 flex flex-row'>
          <button onClick={() => changeUserName()}
            className='relative flex items-center justify-center bg-green-700 px-2 py-1 rounded-sm mx-2 shadow-md drop-shadow-md hover:bg-green-800 transition-all duration-200'
            disabled={loading}
          >
            <p className={loading? 'invisible' : 'visible'}>
              Submit
            </p>
            { loading && <Loading width={24} height={24} />}
          </button>
          <button onClick={() => setShowModal(false)}
            className='bg-red-700 px-2 py-1 rounded-sm mx-2 shadow-md drop-shadow-md hover:bg-red-800 transition-all duration-200'
          >
            Cancel
          </button>
        </div>        
      </motion.div>
    </div>
  )
}
