import React, { useContext } from 'react';
import { useNavigate, useRouteError } from "react-router-dom";
import { AuthContext } from '../../../contexts/AuthProvider';

const ErrorPage = () => {

    const error = useRouteError();
    const { logOut } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogOut = () => { 
        logOut()
            .then(() => {
                localStorage.removeItem('accessToken');
                navigate('/login');
             })
            .catch(error => console.log(error))
    }

    return (
        <div>
            <p className="text-red-500">Something went wrong!!!</p>
            <p className="text-red-400">{error.statusText || error.message}</p>
            <h4 className="text-3xl">Please <button className='btn btn-sm btn-danger' onClick={handleLogOut}>Sign Out</button> and log back in</h4>
        </div>
    );
};

export default ErrorPage;