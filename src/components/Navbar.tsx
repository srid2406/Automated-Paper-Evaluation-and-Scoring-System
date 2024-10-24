import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/instructor">Instructor</Link>
        </li>
        <li>
          <Link to="/evaluation">Evaluation</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
