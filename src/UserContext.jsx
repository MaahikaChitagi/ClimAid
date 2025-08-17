// UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './Config';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setAuthUser(user);

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.exists() ? userDoc.data() : {};

setUserProfile({
  firstName: data.firstName || '',
  lastName: data.lastName || '',
  email: data.email || user.email,
  profilePicture: data.profilePicture || user.photoURL,
  googleName: user.displayName || '',
  userId: user.uid  // ✅ ADD THIS LINE
});

      } else {
        setAuthUser(null);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ authUser, userProfile, setUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
