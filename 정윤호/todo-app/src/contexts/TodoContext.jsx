import React, { createContext, useContext, useReducer, useRef } from 'react';

const initialTodos = [
  {
    id: 1,
    text: '프로젝트 생성하기',
    done: true,
  },
  {
    id: 2,
    text: '컴포넌트 스타일링하기',
    done: true,
  },
  {
    id: 3,
    text: 'Context 만들기',
    done: false,
  },
  {
    id: 4,
    text: '기능 구현하기',
    done: false,
  },
];

// const todoReducer = (state, action) => {
//   const reducer = {
//     CREATE: state.concat(action.todo),
//     TOGGLE: state.map(todo =>
//       todo.id === action.id ? { ...todo, done: !todo.done } : todo,
//     ),
//     REMOVE: state.filter(todo => todo.id !== action.id),
//   };

//   try {
//     return reducer[action.type];
//   } catch (e) {
//     console.error(e);
//   }
// };

const todoReducer = (state, action) => {
  switch (action.type) {
    case 'CREATE':
      return state.concat(action.todo);
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo,
      );
    case 'REMOVE':
      return state.filter(todo => todo.id !== action.id);
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const TodoStateContext = createContext();
const TodoDispatchContext = createContext();
const TodoNextIdContext = createContext();

const TodoProvider = ({ children }) => {
  const [todos, dispatch] = useReducer(todoReducer, initialTodos);
  const nextId = useRef(5);

  return (
    <TodoStateContext.Provider value={todos}>
      <TodoDispatchContext.Provider value={dispatch}>
        <TodoNextIdContext.Provider value={nextId}>
          {children}
        </TodoNextIdContext.Provider>
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
};

export const useTodoState = () => useContext(TodoStateContext);
export const useTodoDispatch = () => useContext(TodoDispatchContext);
export const useTodoNextId = () => useContext(TodoNextIdContext);
export default TodoProvider;
