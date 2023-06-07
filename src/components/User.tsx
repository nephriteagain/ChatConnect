// REACT
import { Dispatch, SetStateAction } from 'react'

// FIREBASE
import { signInWithPopup, signOut } from 'firebase/auth'
import { setDoc, getDoc, doc } from 'firebase/firestore'

// DB FILES
import { auth, provider, db } from '../db/firebase'

// TYPES
import type { userDataType } from '../App'

interface UserProps {
  userData: userDataType
  setUserData: Dispatch<SetStateAction<userDataType>>
}

export default function User({userData, setUserData}: UserProps) {
  


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
                joinedRooms: []
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
    .then(() => setUserData(null))
    .catch(err => console.log(err))
}


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
    <div>
      <div>
      {login}
      </div>
      
    </div>
  )
}
