import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

const useToken = (email) => {
    const [token, setToken] = useState('');
    useEffect(() => {
        if (email) {
            fetch(`https://doctors-portal-server-ellicn3yx-md-asiful-amin-chys-projects.vercel.app/jwt?email=${email}`)
            .then(res => res.json())
            .then(data => {
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    setToken(data.accessToken);
                }
                else {
                    toast.error('Forbidden. No user found for the email.');
                }
            })
            .catch(error => toast.error(error.message))
        }
    }, [email])
    return [token];
};

export default useToken;