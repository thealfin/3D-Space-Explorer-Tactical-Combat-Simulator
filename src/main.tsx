import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SpaceExplorer3D from '../space_explorer_3d.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SpaceExplorer3D />
  </React.StrictMode>
);
