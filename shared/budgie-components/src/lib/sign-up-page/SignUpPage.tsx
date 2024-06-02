import styles from './SignUpPage.module.css';

/* eslint-disable-next-line */
export interface SignUpPageProps {}

export function SignUpPage(props: SignUpPageProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SignUpPage!</h1>
    </div>
  );
}

export default SignUpPage;
