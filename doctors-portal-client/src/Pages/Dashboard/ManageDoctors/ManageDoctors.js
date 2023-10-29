import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';
import Loader from '../../Shared/Loader/Loader';
import ConfirmationModal from '../../Shared/ConfirmationModal/ConfirmationModal';

const ManageDoctors = () => {

    const [deletingDoctor, setDeletingDoctor] = useState(null);

    const { data: doctors, isLoading, refetch } = useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            try {
                const res = await fetch('https://doctors-portal-server-ellicn3yx-md-asiful-amin-chys-projects.vercel.app/doctors', {
                    headers: {
                        authorization: `bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                const data = await res.json();
                return data;
            } catch (error) {
                toast.error(error.message);
            }
        }
    })

    const handleDeleteDoctor = doctor => {
        fetch(`https://doctors-portal-server-ellicn3yx-md-asiful-amin-chys-projects.vercel.app/doctors/${doctor._id}`, {
            method: 'DELETE',
            headers: {
                authorization: `bearer ${localStorage.getItem('accessToken')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.deletedCount > 0) {
                    refetch();
                    toast.success(`Doctor ${doctor.name} deleted successfully`)
                }
            })
    }

    const closeModal = () => {
        setDeletingDoctor(null);
    }

    if (isLoading) {
        return <Loader></Loader>
    }

    return (
      <div className="px-7">
        <h3 className="text-3xl mb-5">Manage Doctors {doctors?.length}</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Specialty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor, idx) => (
                <tr key={doctor._id}>
                  <th>{++idx}</th>
                  <td>
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img src={doctor.image} alt='' />
                      </div>
                    </div>
                  </td>
                  <td>{doctor.name}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.specialty}</td>
                  <td>
                        <label htmlFor="confirmation-modal" className="btn btn-xs btn-error text-white" onClick={() => setDeletingDoctor(doctor)}>Delete</label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {
            deletingDoctor &&
            <ConfirmationModal
                title={`Are you sure you want to delete?`}
                message={`If you delete ${deletingDoctor.name}. It can not be undone.`}
                modalData={deletingDoctor}
                successButtonName='Delete'
                successAction={handleDeleteDoctor}
                closeModal={closeModal}
            ></ConfirmationModal>    
        } 
      </div>
    );
};

export default ManageDoctors;