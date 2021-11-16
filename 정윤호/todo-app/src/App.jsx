import './App.css';
import React from 'react';
import { TodoTemplate, TodoHead } from './components';

const App = () => {
  return (
    <>
      <TodoTemplate>
        <TodoHead />
      </TodoTemplate>
    </>
  );
};

export default App;
