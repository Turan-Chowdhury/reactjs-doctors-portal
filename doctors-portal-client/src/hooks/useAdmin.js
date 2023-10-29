import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

const useAdmin = email => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(true);
    useEffect(() => {
        if (email) {
            fetch(`https://doctors-portal-server-adi5uvffj-md-asiful-amin-chys-projects.vercel.app/users/admin/${email}`)
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