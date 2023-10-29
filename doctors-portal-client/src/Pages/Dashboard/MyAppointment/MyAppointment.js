import React, { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthProvider';
import { useQuery } from 'react-query';
import Loader from '../../Shared/Loader/Loader';
import { Link } from 'react-router-dom';

const MyAppointment = () => {

    const { user } = useContext(AuthContext);

    const url = `https://doctors-portal-server-ellicn3yx-md-asiful-amin-chys-projects.vercel.app/bookings?email=${user?.email}`;

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['bookings', user?.email],
        queryFn: async () => {
          const res = await fetch(url, {
                headers: {
                    authorization: `bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await res.json();
            return data;
        }
    })
  
    if (isLoading) {
      return <Loader></Loader>
    }

    return (
      <div className="px-7">
        <h3 className="text-3xl mb-5">My Appointments</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Treatment</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
                {
                    bookings.map((booking, idx) => <tr key={booking._id}>
                        <th>{++idx}</th>
                        <td>{booking.patient}</td>
                        <td>{booking.treatment}</td>
                        <td>{booking.appointmentDate}</td>
                        <td>{booking.slot}</td>
                        <td>{booking.price}</td>
                        <td>
                          {
                            booking.price && !booking.paid &&
                            <Link to={`/dashboard/payment/${booking._id}`}>
                                <button className='btn btn-xs btn-primary text-white'>Pay</button>
                            </Link>
                          }
                          {
                            booking.price && booking.paid &&
                            <>
                              <span className='text-green-500'>Paid</span>
                              <p className="text-xs">Trans ID : {booking.transactionId}</p>
                            </>
                          }
                        </td>
                    </tr>)
                }
            </tbody>
          </table>
        </div>
      </div>
    );
};

export default MyAppointment;