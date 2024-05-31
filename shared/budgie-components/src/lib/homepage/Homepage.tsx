'use client';
import styles from './Homepage.module.css';
import "../../root.css";

/* eslint-disable-next-line */
export interface HomepageProps {}

export function Homepage(props: HomepageProps) {
  return (
    <div className='mainPage'>
      <span className='pageTitle'>Homepage</span>
    </div>
  );
}

export default Homepage;
