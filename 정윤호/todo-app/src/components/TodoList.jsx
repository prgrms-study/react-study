import styled from '@emotion/styled';
import React from 'react';
import { useTodoState } from '../contexts/TodoContext';
import TodoItem from './TodoItem';

const TodoList = () => {
  const todos = useTodoState();

  return (
    <TodoListBlock>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          text={todo.text}
          done={todo.done}
        />
      ))}
    </TodoListBlock>
  );
};

export default TodoList;

const TodoListBlock = styled.div`
  flex: 1;
  padding: 20px 32px;
  padding-bottom: 48px;
  overflow-y: auto;
`;
