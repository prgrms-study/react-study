import styled from '@emotion/styled';
import React from 'react';
import { parseDate } from '../utils/date';

const TodoHead = ({ ...props }) => {
  const { year, month, date, day } = parseDate(new Date());

  return (
    <Container {...props}>
      <h1>{`${year}년 ${month}월 ${date}일`}</h1>
      <p className="day">{`${day}요일`}</p>
      <p className="left-todo">할 일 2개 남음</p>
    </Container>
  );
};

export default TodoHead;

const Container = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e9ecef;

  h1 {
    font-size: 2rem;
    font-weight: bold;
  }

  .day {
    margin-top: 16px;
    font-size: 1.25rem;
  }

  .left-todo {
    margin-top: 16px;
    font-size: 1.25rem;
    font-weight: bold;
    color: #20c997;
  }
`;
