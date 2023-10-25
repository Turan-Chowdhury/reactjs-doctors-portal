import React from 'react';
import { useForm } from "react-hook-form";

const AddDoctor = () => {

    const { register, formState: { errors }, handleSubmit } = useForm();

    const handleAddDoctor = data => {
        console.log(data);
    }

    return (
        <div className="w-96 p-7">
            <h3 className="text-3xl mb-5">Add A Doctor</h3>
            <form onSubmit={handleSubmit(handleAddDoctor)}>
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text">Name</span>
                        </label>
                        <input
                            type="text"
                            {...register("name", {
                                required: "Name is required."
                            })}
                            className="input input-bordered w-full"
                        />
                        {errors.name && <p className='text-red-600'>{errors.name.message}</p>}
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            {...register("email", {
                                required: "Email is required."
                            })}
                            className="input input-bordered w-full"
                        />
                        {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <label className="label"><span className="label-text">Specialty</span></label>
                        <select className="select select-ghost w-full max-w-xs">
                            <option disabled selected>Pick a specialty</option>
                            <option>Svelte</option>
                            <option>Vue</option>
                            <option>React</option>
                        </select>
                    </div>
                    <input className='btn btn-accent w-full mt-3' value="Add Doctor" type="submit" />
                </form>
        </div>
    );
};

export default AddDoctor;