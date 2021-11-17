import './App.css';
import React from 'react';
import { TodoTemplate, TodoHead, TodoList, TodoCreate } from './components';
import TodoProvider from './contexts/TodoContext';

const App = () => {
  return (
    <TodoProvider>
      <TodoTemplate>
        <TodoHead />
        <TodoList />
        <TodoCreate />
      </TodoTemplate>
    </TodoProvider>
  );
};

export default App;
