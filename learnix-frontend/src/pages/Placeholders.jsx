import React from 'react';

const PlaceholderPage = ({ name }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-gray-800">{name} Page</h2>
        <p className="text-gray-500 mt-2">This page is currently under development.</p>
    </div>
);

export const Register = () => <PlaceholderPage name="Register" />;
export const Profile = () => <PlaceholderPage name="Profile" />;
export const Skills = () => <PlaceholderPage name="Skills" />;
export const Matches = () => <PlaceholderPage name="Matches" />;
export const Chat = () => <PlaceholderPage name="Chat" />;
export const AdminDashboard = () => <PlaceholderPage name="Admin Dashboard" />;
export const Users = () => <PlaceholderPage name="Users Management" />;
