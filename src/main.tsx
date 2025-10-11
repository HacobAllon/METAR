import React from 'react';
import { createRoot } from 'react-dom/client';
import MetarRPLL from './MetarRPLL';
import './App.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

createRoot(container).render(<MetarRPLL />);
