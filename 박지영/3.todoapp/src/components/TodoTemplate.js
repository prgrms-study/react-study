import React from 'react';
import styled from 'styled-components';

const TodoTemplateBlock = styled.div`
  width: 500px;
  height: 600px;

  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.04);

  margin: 50px auto;

  /* margin-top: 50px; */
  /* margin-bottom: 32px; */
  display: flex;
  flex-direction: column;
`;

function TodoTemplate({ children }) {
  return <TodoTemplateBlock>{children}</TodoTemplateBlock>;
}

export default TodoTemplate;