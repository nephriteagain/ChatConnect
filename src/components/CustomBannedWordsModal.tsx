import {Dispatch, SetStateAction, MouseEvent, ChangeEvent ,useEffect, useState} from 'react'

import { auth, db } from '../db/firebase'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'

import { AiFillCloseSquare, AiFillCheckSquare } from 'react-icons/ai'

import type { userType } from './AdminModal'

interface CustomBannedWordsModalProps {
  setShowModal: Dispatch<SetStateAction<boolean>>
  customCensoredWords: string[]
  setCustomCensoredWords: Dispatch<SetStateAction<string[]>>

}

export default function CustomBannedWordsModal({
  setShowModal, 
  customCensoredWords, 
  setCustomCensoredWords
} : CustomBannedWordsModalProps) {


  const [ word, setWord ] = useState<string>('')
  const [ showInput, setShowInput ] = useState<boolean>(false)
  const [ refetch, setRefetch ] = useState<boolean>(true)

  function changeWord(e: ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value
    const newValue = value.replace(/\s/g, '')
    setWord(newValue)
  }

  async function addCensoredWord(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (word.length < 2) return
    if (!auth?.currentUser?.uid) return

    const userId = auth?.currentUser?.uid as string
    const userRef = doc(db, 'users', userId)



    await updateDoc(userRef, {
      censoredWords: arrayUnion(word)
    })
      .then(() => {
        setWord('')
        setRefetch(true)
      })
      .catch(err => {
        throw new Error(err)
      })
  }
  
  async function removeCensoredWord(e: MouseEvent<HTMLButtonElement>, word: string) {
    e.stopPropagation()
    if (!auth?.currentUser?.uid) return

    const userId = auth?.currentUser?.uid as string
    const userRef = doc(db, 'users', userId)

    await updateDoc(userRef, {
      censoredWords: arrayRemove(word)
    })
      .then(() => {
        setRefetch(true)
      })
      .catch(err => {
        throw new Error(err)
      })

  }



  useEffect(() => {
    if (!refetch) return
    if (auth?.currentUser?.uid) {
      const userId = auth?.currentUser?.uid as string

    const userRef = doc(db, 'users', userId)
    getDoc(userRef)
      .then((doc) => {
        if (doc.exists()) {
          const userData = doc.data() as userType
          const bannedWords = userData.censoredWords.reverse()
          setCustomCensoredWords(bannedWords)
        }
      })
      .catch(err => {
        throw new Error(err)
      })
      .finally(() => setRefetch(false))
    }
    

  }, [refetch])





  return (
    <div className="fixed top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center z-[500]">
      <div className="fixed top-0 left-0 h-full w-full bg-myBackground opacity-80 z-[501]"
        onClick={(e) => {
          e.stopPropagation()
          setShowModal(false)
        }}
      />              
      <div className="flex flex-col px-3 py-4 mx-3 z-[502] w-[300px] min-w-[200px] max-h-[500px] min-h-[400px]  bg-mySecondary rounded-lg">
        <p className='mb-6 font-semibold bg-myAccent w-fit px-4 py-1 mx-auto rounded-md'>
          your personal banned words
        </p>       
        <div className='flex flex-col items-center justify-center'>
          <button className='bg-green-800 px-4 py-1 rounded-lg text-sm mb-3 hover:bg-green-900 hover:scale-110 transition-all duration-200'
            onClick={(e) => {
              e.stopPropagation()
              showInput ? setShowInput(false) : setShowInput(true)
            }}
          >
            add new word
          </button>
          { showInput &&
          <>
          <input type='text' maxLength={20}
            className='outline-none w-[90%] rounded-md text-myBackground px-3 py-1 text-center text-sm'
            value={word}
            onChange={(e) => changeWord(e )}
          />
          <div className='text-3xl flex flex-row items-center justify-center mt-2'>
            <button className='mx-1'
              onClick={(e) => addCensoredWord(e)}
            >
              <AiFillCheckSquare className="fill-green-400 hover:scale-110 active:scale-100 transition-all duration-100" />
            </button>
            <button className='mx-1'
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(false)
              }}            
            >
              <AiFillCloseSquare className="fill-red-400 hover:scale-110 active:scale-100 transition-all duration-100" />
            </button>
          </div>
        </>
        }
        </div>
        
        <div className='mb-2 mt-4 bg-myBackground h-[250px] px-4 py-2 overflow-y-auto'>
          {customCensoredWords.length === 0 &&
          <p className='opacity-80 text-sm text-center'>
            you currently have not banned words
          </p>
          }
          { customCensoredWords.length > 0 &&
            customCensoredWords.map((word, index) => {
              return (
                <div className='flex flex-row px-2 py-1 rounded-md group group-hover:visible border border-[transparent] hover:border-white hover:bg-mySecondary'
                  key={index}
                >
                  <p className='me-auto text-sm'>
                    {word}
                  </p>
                  <button className='hidden group-hover:block text-xl hover:scale-110 active-100 transition-all duration-200'
                    onClick={(e) => removeCensoredWord(e,word)}
                  >
                    <AiFillCloseSquare className="fill-red-400"
                    />
                  </button>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}