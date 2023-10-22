import React, { createContext, useEffect, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut, signInWithPopup, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import app from '../firebase/firebase.config';

export const AuthContext = createContext();
const auth = getAuth(app)

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    const providerLogin = (provider) => {
        return signInWithPopup(auth, provider);
    }
    
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const verifyEmail = () => {
        return sendEmailVerification(auth.currentUser)
    }
    
    const updateUser = (userInfo) => {
        return updateProfile(auth.currentUser, userInfo)
    }

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password)
    }

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email)
    }

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('observing the logged user');
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [])

    const authInfo = {
        providerLogin,
        createUser,
        verifyEmail,
        updateUser,
        signIn,
        resetPassword,
        logOut,
        user,
        loading
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;