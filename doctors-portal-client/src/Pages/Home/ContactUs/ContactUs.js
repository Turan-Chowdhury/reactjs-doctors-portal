import React from 'react';
import appointment from '../../../assets/images/appointment.png';

const ContactUs = () => {
    return (
        <section className='mt-32 text-center p-5' style={{ background: `URL(${appointment})`}}>
            <h4 className='mt-7 text-lg text-secondary font-bold'>Contact Us</h4>
            <h1 className="text-white text-2xl">Stay connected with us</h1>
            <input type="text" placeholder="Email Address" className="input input-bordered input-md w-full max-w-xs block text center mt-6 mx-auto" />
            <input type="text" placeholder="Subject" className="input input-bordered input-md w-full max-w-xs block mt-3 mx-auto" />
            <textarea placeholder="Your message" className="textarea textarea-bordered textarea-lg w-full max-w-xs block mt-3 mx-auto" ></textarea>
            <button className="btn btn-primary bg-gradient-to-r from-secondary to-primary text-white mb-9 mt-7">Submit</button>
        </section>
    );
};

export default ContactUs;