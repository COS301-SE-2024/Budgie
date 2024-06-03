'use client';
import styles from './Profile.module.css';
import "../../root.css";

/* eslint-disable-next-line */
export interface ProfileProps {}

export function Profile(props: ProfileProps) {
  return (
    <div className='mainPage'>
      <span className='pageTitle'>Profile</span>
    </div>
  );
}

export default Profile;
