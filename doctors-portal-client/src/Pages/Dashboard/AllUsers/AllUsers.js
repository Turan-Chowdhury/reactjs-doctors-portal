import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';
import ConfirmationModal from '../../Shared/ConfirmationModal/ConfirmationModal';

const AllUsers = () => {

    const [deletingUser, setDeletingUser] = useState(null);

    const { data: users = [], refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
          const res = await fetch('https://doctors-portal-server-ellicn3yx-md-asiful-amin-chys-projects.vercel.app/users', {
              headers: {
                  authorization: `bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await res.json();
            return data;
        }
    })

    const handleMakeAdmin = id => {
        fetch(`https://doctors-portal-server-ellicn3yx-md-asiful-amin-chys-projects.vercel.app/users/admin/${id}`, {
            method: 'PUT',
            headers: {
                authorization: `bearer ${localStorage.getItem('accessToken')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.modifiedCount > 0) {
                    toast.success('Make Admin Successful');
                    refetch();
                }
                else {
                    toast.error("You don't have admin access")
                }
            })
      }
  
      const handleDeleteUser = user => {
        fetch(`https://doctors-portal-server-ellicn3yx-md-asiful-amin-chys-projects.vercel.app/users/${user._id}`, {
            method: 'DELETE',
            headers: {
                authorization: `bearer ${localStorage.getItem('accessToken')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.deletedCount > 0) {
                    refetch();
                    toast.success(`User ${user.name} deleted successfully`)
                }
            })
    }

    const closeModal = () => {
        setDeletingUser(null);
    }

    return (
      <div className="px-7">
        <h3 className="text-3xl mb-5">All Users</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id}>
                  <th>{++idx}</th>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {
                      user?.role !== 'admin' &&
                      <button onClick={() => handleMakeAdmin(user._id)} className='btn btn-xs btn-primary text-white'>Make Admin</button>
                    }
                  </td>
                  <td>
                    <label htmlFor="confirmation-modal" className="btn btn-xs btn-error text-white" onClick={() => setDeletingUser(user)}>user</label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {
            deletingUser &&
            <ConfirmationModal
                title={`Are you sure you want to delete?`}
                message={`If you delete ${deletingUser.name}. It can not be undone.`}
                modalData={deletingUser}
                successButtonName='Delete'
                successAction={handleDeleteUser}
                closeModal={closeModal}
            ></ConfirmationModal>    
        }
      </div>
    );
};

export default AllUsers;