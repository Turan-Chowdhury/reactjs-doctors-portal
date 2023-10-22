import React from 'react';
import Banner from '../Banner/Banner';
import InfoCards from '../InfoCards/InfoCards';
import Services from '../Services/Services';
import bg from '../../../assets/images/bg.png';
import MakeAppointment from '../MakeAppointment/MakeAppointment';
import Testimonial from '../Testimonial/Testimonial';
import Treatment from '../Treatment/Treatment';
import ContactUs from '../ContactUs/ContactUs';

const Home = () => {
    return (
        <div className='mx-5'>
            <div style={{background: `url(${bg})`}}>
                <Banner></Banner>
                <InfoCards></InfoCards>
            </div>
            <div>
                <Services></Services>
                <Treatment></Treatment>
                <MakeAppointment></MakeAppointment>
                <Testimonial></Testimonial>
                <ContactUs></ContactUs>
            </div>
        </div>
    );
};

export default Home; 