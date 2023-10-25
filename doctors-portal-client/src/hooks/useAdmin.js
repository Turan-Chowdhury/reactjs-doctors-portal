import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

const useAdmin = email => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(true);
    useEffect(() => {
        if (email) {
            fetch(`http://localhost:5000/users/admin/${email}`)
            .then(res => res.json())
            .then(data => {
                setIsAdmin(data.isAdmin);
                setIsAdminLoading(false);
            })
            .catch(error => toast.error(error.message))
        }
    }, [email])
    return [isAdmin, isAdminLoading];
}

export default useAdmin;