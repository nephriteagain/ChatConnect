import { useState, useEffect } from "react";
import { onSnapshot, CollectionReference, DocumentData } from "firebase/firestore";

export function useRoomsSnapshot<T>(ref:CollectionReference<DocumentData>,initial: T[], effectDependecies: any[] = [])  {
    const [ data, setData ] = useState(initial)

    useEffect(() => {
        const unsub = onSnapshot(ref, (querySnapshot) => {
            const roomList : T[] = []
            querySnapshot.forEach(doc => {
                roomList.push({...doc.data(), id: doc.id} as T)
            })
            setData(roomList)
        })  
        return () => unsub()
    }, effectDependecies)

    return data
}