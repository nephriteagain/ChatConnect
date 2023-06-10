// REACT
import { Dispatch, SetStateAction, useState, useEffect } from 'react'

// FIREBASE
import { signInWithPopup, signOut } from 'firebase/auth'
import { setDoc, getDoc, doc } from 'firebase/firestore'

// DB FILES
import { auth, provider, db } from '../db/firebase'

import UserModal from './UserModal'

import { MdOutlineEdit} from 'react-icons/md'

// TYPES
import type { userDataType } from '../App'

interface UserProps {
  userData: userDataType
  setUserData: Dispatch<SetStateAction<userDataType>>
  setJoinedRoomId: Dispatch<SetStateAction<string|null>>
  userName: string
  setUserName: Dispatch<SetStateAction<string>>
}

export default function User({userData, setUserData, setJoinedRoomId, userName, setUserName}: UserProps) {

  const [showModal, setShowModal ] = useState<boolean>(false)

  async function getUserData() {
    if (!userData) return
    const userRef = doc(db, 'users', userData.uid)
    const data = await getDoc(userRef)
      .catch(err => {
        throw new Error(err)
      })
    const userNameData = data.data()?.userName
    userNameData && setUserName(userNameData)
  }


  async function signInWithGoogle() {
    await signInWithPopup(auth, provider)
      .then((data) => {
        const userObject = data.user
        const uid = data.user.uid
        const userDbRef = doc(db, 'users', uid)
        getDoc(userDbRef)
          .then(result => {
            const user = result.data()
            if (!user) {
              setDoc(userDbRef, {
                name: userObject.displayName,
                email: userObject.email,
                userName: userObject.email,
                id: uid,
                joinedAt: Date.now(),
              })
                .catch(err => {
                  throw new Error(err)
                })
            }
          })
          .catch(err => {
            throw new Error(err)
          })
      })
      .catch(err => console.log(err))
    
}

async function userSignOut() {
  await signOut(auth)
    .then(() => {
      setUserData(null)
      setUserName('')
      setJoinedRoomId(null)
    })
    .catch(err => {
      throw new Error(err)
    })
}

  useEffect(() => {
    getUserData()
  }, [userData])


  const login = userData
    ? <button onClick={userSignOut}
    className='bg-myText text-myBackground px-2 py-[0.4rem] shadow-sm drop-shadow-md rounded-sm hover:shadow-md active:scale-[0.95] transition-all duration-100'
    >
    Sign out
  </button>
  : <button onClick={signInWithGoogle} 
  className='bg-myText text-myBackground shadow-sm drop-shadow-md rounded-sm hover:shadow-md active:scale-[0.95] transition-all duration-100'
>
    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/G-on-clear.svg' alt='google-logo' className='inline'/>
    <span className='me-2'>
      Sign in with Google
    </span>
</button>

  return (
    <>
    {showModal && 
    <UserModal 
      userName={userName}
      setUserName={setUserName}
      setShowModal={setShowModal}
      userData={userData}
    />}
    <div className='flex mt-2 mx-2'>           
      <div className='ms-auto flex items-center justify-center'>      
      
      <div className='me-4'>
        { userData && <button className='me-2 bg-myText text-mySecondary px-1 py-1 rounded-md hover:scale-105 active:scale-100 transition-all duration-100'
          onClick={() => setShowModal(true)}
        >
          <MdOutlineEdit />
        </button>}
        {userName}
      </div>
      {login}      
      </div>
      
    </div>
    </>
  )
}
