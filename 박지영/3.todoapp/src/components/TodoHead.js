import React from 'react';
import styled from 'styled-components';
import { useTodoState } from '../contexts/TodoContext';

const TodoHeadBlock = styled.div`
  padding: 30px 20px;
  border-bottom: 1px solid #e9ecef;
  border-bottom: 2px solid #e9ecef;
  h1 {
    margin: 0;
    font-size: 24px;
    color: #343a40;
  }
  .day {
    margin-top: 4px;
    color: #868e96;
    font-size: 18px;
  }
  .tasks-left {
    color: #2856ad;
    font-size: 14px;
    margin-top: 20px;
    font-weight: bold;
  }
`;

function TodoHead() {
  const todos = useTodoState();
  const undoneTasks = todos.filter(todo => !todo.done);

  const today = new Date();
  const dateString = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <TodoHeadBlock>
      <h1>{dateString}</h1>
      <div className="tasks-left">할 일 {undoneTasks.length}개 남음</div>
    </TodoHeadBlock>
  );
}

export default TodoHead;
