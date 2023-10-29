import {React, useContext, useState} from 'react';
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthProvider';
import { FaGoogle } from "react-icons/fa";
import { GoogleAuthProvider } from 'firebase/auth';
import toast from 'react-hot-toast';
import useToken from '../../hooks/useToken';

const Login = () => {

    const { register, formState: { errors }, handleSubmit } = useForm();
    const { signIn, providerLogin, resetPassword } = useContext(AuthContext);
    const [loginError, setLoginError] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [loggedUserEmail, setLoggedUserEmail] = useState('');
    const [token] = useToken(loggedUserEmail);
    const location = useLocation();
    const navigate = useNavigate();
    
    const from = location.state?.from?.pathname || '/';

    if (token) {
        navigate(from, { replace: true });
    }
    
    const handleLogin = data => {
        setLoginError('');
        signIn(data.email, data.password)
            .then(result => {
                //const user = result.user;
                //console.log(user);
                setLoggedUserEmail(data.email);
            })   
    }
    
    const googleProvider = new GoogleAuthProvider()
    
    const handleGoogleSignIn = () => {
        providerLogin(googleProvider)
            .then(result => {
                const user = result.user;
                //console.log(user);
                saveUser(user.displayName, user.email);
            })
            .catch(error => setLoginError(error.message))
    }

    const handleEmailBlur = event => {
        const email = event.target.value;
        setUserEmail(email);
    }

    const handleForgetPassword = () => {
        if (!userEmail) {
            toast("Please enter your email address.");
            return;
        }
        resetPassword(userEmail)
            .then(() => {
                toast("Password reset email send. Please check your email.")
            })
            .catch(error => toast.error(error.message))
    }

    const saveUser = (name, email) => {
        const user = { name, email };
        fetch('https://doctors-portal-server-ellicn3yx-md-asiful-amin-chys-projects.vercel.app/users', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(res => res.json())
            .then(data => {
                //console.log('saved user data', data);
                setLoggedUserEmail(email);
            })
            .catch(error => toast.error(error.message))
    }

    return (
        <div className='h-[800px]] flex justify-center items-center'>
            <div className='w-96 p-7'>
                <h2 className="text-xl text-center my-4">Login</h2>
                <form onSubmit={handleSubmit(handleLogin)}>
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            onBlur={handleEmailBlur}
                            type="email"
                            {...register("email", {
                                required: "Email is required."
                            })}
                            className="input input-bordered w-full"
                        />
                        {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <label className="label"><span className="label-text">Password</span></label>
                        <input
                            type="password"
                            {...register("password", {
                                required: "Password is required.",
                                minLength: { value: 6, message: "Password must be 6 characters or longer."}
                            })}
                            className="input input-bordered w-full"
                        />
                        {errors.password && <p className='text-red-600'>{errors.password.message}</p>}
                        <label onClick={handleForgetPassword} className="label"><span className="label-text btn btn-link">Forget Password?</span></label>
                    </div>
                    <input className='btn btn-accent w-full mt-2' value="login" type="submit" />
                    <div>
                        {loginError && <p className='text-red-600 text-center mt-2'>{loginError}</p> }
                    </div>
                </form>
                <p className='text-center mt-4 '>New to Doctors Portal? <Link to='/signup' className='text-secondary'>Create new account</Link></p>
                <div className="divider">OR</div>
                <button onClick={handleGoogleSignIn} className='btn btn-outline w-full'><FaGoogle></FaGoogle>CONTINUE WITH GOOGLE</button>
            </div>
        </div>
    );
};

export default Login;