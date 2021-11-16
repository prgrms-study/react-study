import styled from '@emotion/styled';
import React from 'react';
import { useTodoState } from '../contexts/TodoContext';
import { parseDate } from '../utils/date';

const TodoHead = ({ ...props }) => {
  const { year, month, date, day } = parseDate(new Date());
  const todos = useTodoState();
  console.log(todos);

  return (
    <Container {...props}>
      <h1>{`${year}년 ${month}월 ${date}일`}</h1>
      <p className="day">{`${day}요일`}</p>
      <p className="left-todo">
        할 일 {todos.filter(todo => !todo.done).length}개 남음
      </p>
    </Container>
  );
};

export default TodoHead;

const Container = styled.div`
  padding: 32px;
  border-bottom: 1px solid #e9ecef;

  h1 {
    font-size: 2rem;
    font-weight: bold;
  }

  .day {
    margin-top: 8px;
    font-size: 1.25rem;
  }

  .left-todo {
    margin-top: 24px;
    font-size: 1.25rem;
    font-weight: bold;
    color: #20c997;
  }
`;
