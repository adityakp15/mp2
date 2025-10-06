import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Pokédex
        </Link>
        <ul className={styles.navLinks}>
          <li>
            <Link to="/">List View</Link>
          </li>
          <li>
            <Link to="/gallery">Gallery View</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
