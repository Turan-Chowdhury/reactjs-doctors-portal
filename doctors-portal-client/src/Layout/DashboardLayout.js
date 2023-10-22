import React from 'react';
import Navbar from '../Pages/Shared/Navbar/Navbar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        <div>
            <Navbar></Navbar>
            
            <div className="drawer lg:drawer-open">
                <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    {/* Page content here */}
                    <Outlet></Outlet>
                    {/* <label htmlFor="dashboard-drawer" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>                 */}
                </div> 
                <div className="drawer-side">
                    <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label> 
                    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                        {/* Sidebar content here */}
                        <li><a>Sidebar Item 1</a></li>
                        <li><a>Sidebar Item 2</a></li>
                    </ul>                
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;