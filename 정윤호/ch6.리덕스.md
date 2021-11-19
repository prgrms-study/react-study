## 6.1. 리덕스에서 사용되는 키워드 숙지하기

### 액션 (Action)

상태에 변화가 필요할 때 발생시킴 (객체하나로 표현)
type을 필수로 그외의 값들은 개발자 마음대로 생성

```js
// 액션 객체
{
  type: "ADD_TODO",
  data: {
    id: 0,
    text: "리덕스 배우기"
  }
}
```



### 액션 생성함수 (Action Creator)

액션을 만드는 함수, 컴포넌트에서 더욱 쉽게 액션을 발생시키기 위함 (필수 아님)

보통 함수 앞에 `export` 키워드를 붙여서 다른 파일에서 불러와서 사용

```js
export const changeInput = text => ({ 
  type: "CHANGE_INPUT",
  text
});
```



### 리듀서 (Reducer)

변화를 일으키는 함수
현재의 상태와 액션을 참조하여 새로운 상태를 반환

```javascript
function counter(state, action) {
  switch (action.type) {
    case 'INCREASE':
      return state + 1;
    case 'DECREASE':
      return state - 1;
    default:
      return state;
  }
}
```

`useReducer` 에선 일반적으로 `default:` 부분에 `throw new Error('Unhandled Action')`과 같이 에러를 발생시키도록 처리하는게 일반적인 반면 **리덕스의 리듀서에서는 기존 `state`를 그대로 반환하도록 작성한다.**



### 스토어 (Store)

한 애플리케이션당 하나의 스토어
현재의 앱 **상태**와, **리듀서**, **내장함수** 포함



### 디스패치 (dispatch)

스토어의 내장함수 중 하나, 액션을 파라미터로 받아 액션을 발생 시키는 함수

```js
dispatch(action)
```



### 구독 (subscribe)

스토어의 내장함수 중 하나
subscribe 함수에 특정 함수를 전달해주면, 액션이 디스패치 되었을 때 마다 전달해준 함수가 호출

```js
const unsubscribe = store.subscribe(listener);
// 구독을 해제하고 싶을 때는 unsubscribe() 를 호출하면 됩니다.
```





## 6.2. 리덕스의 3가지 규칙

### 1. 하나의 애플리케이션에 하나의 스토어

- 여러개로 분리는 가능하나 권장되지는 않는다.(개발도구를 사용하지 못하게 된다.)



### 2. 상태는 읽기전용

- 리액트의 불변성
-  Immutable.js 혹은 Immer.js 사용하여 불변성을 유지할 수 있다.



### 3. 변화를 일으키는 함수, 리듀서는 순수한 함수

- 리듀서 함수는 **이전 상태**와, **액션 객체**를 파라미터로 받는다.
- **이전의 상태는 절대로 건들이지 않고**, 변화를 일으킨 새로운 상태 객체를 만들어서 반환한다.
- 똑같은 파라미터로 호출된 리듀서 함수는 **언제나** **똑같은 결과값을 반환**해야만 한다.
- `new Date()`, `랜덤 숫자 생성`, `네트워크에 요청` 등은 순수하지 않은 작업은 리듀서 밖에서 처리
- 리듀서에서 처리할 수 없는 순수하지 않는 작업은 **리덕스 미들웨어**를 사용하여 처리하곤 한다.



## 6.3. 리덕스 사용할 준비



### 타입과 액션생성 함수

```js
/* 액션 타입 정의 */
// 액션 타입은 주로 대문자로 작성합니다.
const INCREASE = 'INCREASE';
const DECREASE = 'DECREASE';
const CHANGE_TEXT = 'CHANGE_TEXT';
const ADD_TO_LIST = 'ADD_TO_LIST';

/* 액션 생성함수 정의 */
// 액션 생성함수는 주로 camelCase 로 작성합니다.
function increase() {
  return {
    type: INCREASE, // 액션 객체에는 type 값이 필수입니다.
  };
}

// 화살표 함수로 작성하는 것이 더욱 코드가 간단하기에,
// 이렇게 쓰는 것을 추천합니다.
const decrease = () => ({
  type: DECREASE,
});

const changeText = text => ({
  type: CHANGE_TEXT,
  text, // 액션안에는 type 외에 추가적인 필드를 마음대로 넣을 수 있습니다.
});

const addToList = item => ({
  type: ADD_TO_LIST,
  item,
});
```



### 리듀서

```js
/* 리듀서 만들기 */
// 위 액션 생성함수들을 통해 만들어진 객체들을 참조하여
// 새로운 상태를 만드는 함수를 만들어봅시다.
// 주의: 리듀서에서는 불변성을 꼭 지켜줘야 합니다!

function reducer(state = initialState, action) {
  // state 의 초깃값을 initialState 로 지정했습니다.
  switch (action.type) {
    case INCREASE:
      return {
        ...state,
        counter: state.counter + 1,
      };
    case DECREASE:
      return {
        ...state,
        counter: state.counter - 1,
      };
    case CHANGE_TEXT:
      return {
        ...state,
        text: action.text,
      };
    case ADD_TO_LIST:
      return {
        ...state,
        list: state.list.concat(action.item),
      };
    default:
      return state;
  }
}
```



### 스토어 생성

스토어는 리듀서로 생성한다.

```js
/* 스토어 만들기 */
const store = createStore(reducer);

console.log(store.getState()); // 현재 store 안에 들어있는 상태를 조회합니다.
```



### 스토어 구독(Sbuscribe)

```js
// 스토어안에 들어있는 상태가 바뀔 때 마다 호출되는 listener 함수
const listener = () => {
  const state = store.getState();
  console.log(state);
};

const unsubscribe = store.subscribe(listener);
// 구독을 해제하고 싶을 때는 unsubscribe() 를 호출하면 됩니다.
```



### 액션으로 디스패치 - 스토어 상태 다루기

```js
// 액션들을 디스패치 해봅시다.
store.dispatch(increase());
store.dispatch(decrease());
store.dispatch(changeText('안녕하세요'));
store.dispatch(addToList({ id: 1, text: '와우' }));
```

##### 출력결과

![1kwc0ML](https://i.imgur.com/1kwc0ML.png)



## 6.4. 리덕스 모듈 만들기

### 리덕스 모듈이란?

다음 항목들이 모두 들어있는 자바스크립트 파일을 의미한다.

- 액션 타입
- 액션 생성함수
- 리듀서



위 항목들을 각각 다른 파일에 저장 할 수도 있다.

##### 파일 분리 예시

- actions
  - index.js
- reducers
  - todos.js
  - visibilityFilter.js
  - index.js

> [Ducks 패턴](https://github.com/erikras/ducks-modular-redux)
>
> 서로 다른 파일에 분리가 되어있으면 개발을 하는데 꽤나 불편하다.
>
> 관련된 기능들을 하나의 파일에 몰아서 작성하는 패턴을 Ducks패턴이라고 한다.
>
> (새끼오리들이 뭉쳐다니는것을 상상해보자...)



### 리덕스 모듈 예제의 목표 

- 루트 리듀서 - 여러개의 리덕스 모듈을 하나로 관리
  - counter 리덕스 모듈 - counter 리듀서
  - todos 리덕스 모듈 - todos 리듀서



### counter 리덕스 모듈

```js
// modules/counter.js

/* 액션 타입 만들기 */
// Ducks 패턴을 따를땐 액션의 이름에 접두사를 넣어주세요.
// 이렇게 하면 다른 모듈과 액션 이름이 중복되는 것을 방지 할 수 있습니다.
const SET_DIFF = 'counter/SET_DIFF';
const INCREASE = 'counter/INCREASE';
const DECREASE = 'counter/DECREASE';

/* 액션 생성함수 만들기 */
// 액션 생성함수를 만들고 export 키워드를 사용해서 내보내주세요.
export const setDiff = diff => ({ type: SET_DIFF, diff });
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

/* 초기 상태 선언 */
const initialState = {
  number: 0,
  diff: 1
};

/* 리듀서 선언 */
// 리듀서는 export default 로 내보내주세요.
export default function counter(state = initialState, action) {
  switch (action.type) {
    case SET_DIFF:
      return {
        ...state,
        diff: action.diff
      };
    case INCREASE:
      return {
        ...state,
        number: state.number + state.diff
      };
    case DECREASE:
      return {
        ...state,
        number: state.number - state.diff
      };
    default:
      return state;
  }
}
```



### todos.js 리덕스 모듈

```js
// modules/todos.js

/* 액션 타입 선언 */
const ADD_TODO = 'todos/ADD_TODO';
const TOGGLE_TODO = 'todos/TOGGLE_TODO';

/* 액션 생성함수 선언 */
let nextId = 1; // todo 데이터에서 사용 할 고유 id
export const addTodo = text => ({
  type: ADD_TODO,
  todo: {
    id: nextId++, // 새 항목을 추가하고 nextId 값에 1을 더해줍니다.
    text
  }
});
export const toggleTodo = id => ({
  type: TOGGLE_TODO,
  id
});

/* 초기 상태 선언 */
// 리듀서의 초기 상태는 꼭 객체타입일 필요 없습니다.
// 배열이여도 되고, 원시 타입 (숫자, 문자열, 불리언 이여도 상관 없습니다.
const initialState = [
  /* 우리는 다음과 같이 구성된 객체를 이 배열 안에 넣을 것입니다.
  {
    id: 1,
    text: '예시',
    done: false
  } 
  */
];

export default function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return state.concat(action.todo);
    case TOGGLE_TODO:
      return state.map(
        todo =>
          todo.id === action.id // id 가 일치하면
            ? { ...todo, done: !todo.done } // done 값을 반전시키고
            : todo // 아니라면 그대로 둠
      );
    default:
      return state;
  }
}
```



### 루트 리듀서

러개의 리듀서가 있을때는 이를 한 리듀서로 합쳐서 사용, 합쳐진 리듀서를 루트 리듀서라고 한다.

리듀서를 합치는 작업은 리덕스에 내장되어있는 [`combineReducers`](https://redux.js.org/api/combinereducers)라는 함수를 사용

```js
import { combineReducers } from 'redux';
import counter from './counter';
import todos from './todos';

const rootReducer = combineReducers({
  counter,
  todos
});

export default rootReducer;
```



### store 생성

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore } from 'redux';
import rootReducer from './modules';

const store = createStore(rootReducer); // 스토어를 만듭니다.
console.log(store.getState()); // 스토어의 상태를 확인해봅시다.

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```



##### 결과

![uDzQ8BV](https://i.imgur.com/uDzQ8BV.png)

counter, todos 서브 리듀서의 상태가 합쳐져있다.

우리의 스토어에 저장된 상태는 `store.counter` , `store.todos` 와 같은 형태로 객체를 반환한다. (`store` 는 임의로 작성한것이다.)



### 리액트 프로젝트에 리덕스 적용하기

리액트 프로젝트에 리덕스를 적용 할 때에는 react-redux 라는 라이브러리를 사용해야 한다.

```shell
$ yarn add react-redux
```



이후 `Provider`라는 컴포넌트를 불러와서 `App` 컴포넌트를 감싸고 `Provider`의 `props` 에 `store` 를 넣어준다.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';

const store = createStore(rootReducer); // 스토어를 만듭니다.
console.log(store.getState()); // 스토어의 상태를 확인해봅시다.

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

```

이렇게 하면 `Provider` 의 모든 자식 컴포넌트에서 **리덕스 스토어**에 접근 할 수 있다.



## 6.5. 카운터(Counter 컴포넌트) 구현하기

### 프리젠테이셔널 컴포넌트 만들기

> **프리젠테이셔널 컴포넌트란?**
>
> 리덕스 스토어에 직접적으로 접근하지 않고 필요한 값 또는 함수를 props 로만 받아와서 사용하는 컴포넌트



```jsx
// components/Counter.jsx

import React from 'react';

function Counter({ number, diff, onIncrease, onDecrease, onSetDiff }) {
  const onChange = e => {
    // e.target.value 의 타입은 문자열이기 때문에 숫자로 변환해주어야 합니다.
    onSetDiff(parseInt(e.target.value, 10));
  };
  return (
    <div>
      <h1>{number}</h1>
      <div>
        <input type="number" value={diff} min="1" onChange={onChange} />
        <button onClick={onIncrease}>+</button>
        <button onClick={onDecrease}>-</button>
      </div>
    </div>
  );
}

export default Counter;

```

프리젠테이셔널 컴포넌트에선 주로 이렇게 UI를 선언하는 것에 집중한다.

필요한 값들이나 함수는 props 로 받아와서 사용하는 형태로 구현한다.



### 컨테이너 컴포넌트 만들기

> **컨테이너 컴포넌트란?** 
>
> 리덕스 스토어의 상태를 조회하거나, 액션을 디스패치 할 수 있는 컴포넌트
>
> 그리고, HTML 태그들을 사용하지 않고 다른 프리젠테이셔널 컴포넌트들을 불러와서 사용한다.ㄴ



```js
// containers/CounterContainer.jsx

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Counter from '../components/Counter';
import { increase, decrease, setDiff } from '../modules/counter';

function CounterContainer() {
  // useSelector는 리덕스 스토어의 상태를 조회하는 Hook입니다.
  // state의 값은 store.getState() 함수를 호출했을 때 나타나는 결과물과 동일합니다.
  const { number, diff } = useSelector(state => ({
    number: state.counter.number,
    diff: state.counter.diff
  }));

  // useDispatch 는 리덕스 스토어의 dispatch 를 함수에서 사용 할 수 있게 해주는 Hook 입니다.
  const dispatch = useDispatch();
  // 각 액션들을 디스패치하는 함수들을 만드세요
  const onIncrease = () => dispatch(increase());
  const onDecrease = () => dispatch(decrease());
  const onSetDiff = diff => dispatch(setDiff(diff));

  return (
    <Counter
      // 상태와
      number={number}
      diff={diff}
      // 액션을 디스패치 하는 함수들을 props로 넣어줍니다.
      onIncrease={onIncrease}
      onDecrease={onDecrease}
      onSetDiff={onSetDiff}
    />
  );
}

export default CounterContainer;
```



### useSelecotr

리덕스 스토어의 상태를 조회하는 Hook

```js
useSelector(state => ({
  number: state.counter.number,
  diff: state.counter.diff,
}));
```

상태는 콜백함수의 인자로 받아와지고, 반환 받고자하는 형태로 정의할 수 있다. 



#### useDispatch

리덕스 스토어의 내장함수인 `dispatch`를 사용 할 수 있게 해주는 Hook

```js
const dispatch = useDispatch();

const onIncrease = () => dispatch(액션함수 or 액션객체);
```



### 마치며

##### 프리젠테이셔널 컴포넌트와 컨테이너 컴포넌트 구분

- 리덕스의 창시자는 프리젠테이셔널 컴포넌트와 컨테이너 컴포넌트를 분리해서 작업

- 벨로퍼트님은 프리젠테이셔널 / 컨테이너 컴포넌트를 구분지어서 작성하긴 하지만 디렉터리 상으로는 따로 구분 짓지 않으신다.



## 6.6 리덕스 개발자 도구 적용하기

### 리덕스 개발자 도구란?

- 리덕스 개발자 도구를 사용하면 현재 스토어의 상태를 개발자 도구에서 조회 할 수 있고 

- 지금까지 어떤 액션들이 디스패치 되었는지, 

- 그리고 액션에 따라 상태가 어떻게 변화했는지 확인 할 수 있다.

- 추가적으로, 액션을 직접 디스패치 할 수도 있다.



##### 준비

- [크롬 웹 스토어](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) 에서 확장 프로그램을 설치

- 프로젝트에 [redux-devtools-extension](https://www.npmjs.com/package/redux-devtools-extension)을 설치

  - ```shell
    $ yarn add redux-devtools-extension
    ```

    

##### 적용방법

```jsx
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(rootReducer, composeWithDevTools());
```

단순하게 스토어를 생성할 때  composeWithDevTools 를 사용하여 리덕스 개발자 도구 활성화해주면 된다.



## 6.7. 할 일 목록(Todos 컴포넌트) 구현하기

### 프리젠테이셔널 컴포넌트 구현하기

```jsx
// components/TodosContainer.jsx

import React, { useState } from 'react';

// 컴포넌트 최적화를 위하여 React.memo를 사용합니다
const TodoItem = React.memo(function TodoItem({ todo, onToggle }) {
  return (
    <li
      style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
      onClick={() => onToggle(todo.id)}
    >
      {todo.text}
    </li>
  );
});

// 컴포넌트 최적화를 위하여 React.memo를 사용합니다
const TodoList = React.memo(function TodoList({ todos, onToggle }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  );
});

function Todos({ todos, onCreate, onToggle }) {
  // 리덕스를 사용한다고 해서 모든 상태를 리덕스에서 관리해야하는 것은 아닙니다.
  const [text, setText] = useState('');
  const onChange = e => setText(e.target.value);
  const onSubmit = e => {
    e.preventDefault(); // Submit 이벤트 발생했을 때 새로고침 방지
    onCreate(text);
    setText(''); // 인풋 초기화
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={text}
          placeholder="할 일을 입력하세요.."
          onChange={onChange}
        />
        <button type="submit">등록</button>
      </form>
      <TodoList todos={todos} onToggle={onToggle} />
    </div>
  );
}

export default Todos;
```



### 컨테이너 컴포넌트

```jsx
// container/TodosContainer.jsx

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Todos from '../components/Todos';
import { addTodo, toggleTodo } from '../modules/todos';

function TodosContainer() {
  // useSelector 에서 꼭 객체를 반환 할 필요는 없습니다.
  // 한 종류의 값만 조회하고 싶으면 그냥 원하는 값만 바로 반환하면 됩니다.
  const todos = useSelector(state => state.todos);
  const dispatch = useDispatch();

  const onCreate = text => dispatch(addTodo(text));
  const onToggle = useCallback(id => dispatch(toggleTodo(id)), [dispatch]); // 최적화를 위해 useCallback 사용

  return <Todos todos={todos} onCreate={onCreate} onToggle={onToggle} />;
}

export default TodosContainer;
```



## 6.8 useSelector 최적화

 프리젠테이셔널 컴포넌트에서 React.memo를 사용하여 리렌더링 최적화하였다.

그렇다면 컨테이너 컴포넌트에서는 어떤 것들을 검토하여 최적화할 수 있을까?



### 다시 예제로!

![PhazYbT](https://i.imgur.com/PhazYbT.gif)

카운터의 +, - 를 눌러보시면 하단의 할 일 목록이 리렌더링되진 않는다.

하지만 할 일 목록의 항목을 토글 할 때에는 카운터가 리렌더링되는 것을 확인 할 수 있다.

> counter가 바뀌어도 todos는 변화가 없다.
>
> todos가 바뀌면 counter가 리렌더링된다.



### 💡 중요!

기본적으로, `useSelector`를 사용해서 리덕스 스토어의 상태를 조회 할 땐 만약 **상태가 바뀌지 않았으면 리렌더링하지 않는다.**

만약 `useSelector` 로 상태를 조회할 때 값이 바뀌어있다면 리렌더링 된다.

**정확하게 말하면 `useSelector` 의 첫번째 인자인 콜백함수의 반환 결과의 메모리 주소와 이전 반환 결과 메모리 주소를 비교하여 다르면 리렌더링을 하는것 같다.**



> **useSelecotr 리마인드!**
>
> 리덕스 스토어의 상태를 조회하는 Hook
>
> ```js
> useSelector(state => ({
>   number: state.counter.number,
>   diff: state.counter.diff,
> }));
> ```
>
> 상태는 콜백함수의 인자로 받아와지고, 반환 받고자하는 형태로 정의할 수 있다. 



#### store의 상태

```js
{
  counter: {
    number: 1,
    diff: 1
  },
  todos: [
    {
      id: 1,
      text: '할일'
    }
  ]
}
```



#### 왜 counter가 바뀌어도 todos는 변화가 없지?

**`TodosContainer` 컴포넌트는 스토어의 `counter` 값이 바뀔 때 `todos` 값엔 변화가 없으니까, 리렌더링되지 않는다.**

```js
// in TodosContainer
const todos = useSelector(state => state.todos);
```

`state.todos` 를 조회하기 때문에 상태비교상 문제가 없다!

이전 `state.todos` 와 현재 `state.todos` 를 비교



#### 왜 todos가 바뀌면 counter가 리렌더링이 되지?

하지만! `CounterContainer` 컴포넌트는  `useSelector` Hook 을 통해 매번 렌더링 될 때마다 새로운 객체 `{ number, diff }`를 만드는 것이기 때문에 상태가 바뀌었는지 바뀌지 않았는지 확인을 할 수 없어서 낭비 렌더링이 이루어지고 있는 것 이다.

```js
// in CounterContainer

const { number, diff } = useSelector(state => ({
  number: state.counter.number,
  diff: state.counter.diff
}));
```

`state` 자체를 반화하는 것이 아닌 객체를 감싸서 반환한다.

따라서 매번 실행될 때 마다 새로운 객체를 반환한다. 그래서 매번 리렌더링이 된다.

이전 객체와 현재 객체의 메모리주소가 다르죠!?



### 최적화 방법

#### 첫번째, `useSelector` 를 여러번 사용하기

```js
const number = useSelector(state => state.counter.number);
const diff = useSelector(state => state.counter.diff);
```

이렇게 하면 해당 값들 하나라도 바뀌었을 때에만 컴포넌트가 리렌더링 된다.



#### 두번째, react-redux의 `shallowEqual` 함수를 `useSelector`의 두번째 인자로 전달해주기

`useSelector` 의 두번째 파라미터는 `equalityFn` 이다.

```javascript
equalityFn?: (left: any, right: any) => boolean
```

이 함수로 이전 값과 다음(현재) 값을 비교하여 같은면(true) 리렌더링을 하지 않고, 다르면(flase) 리렌더링을 한다.

`shallowEqual`은 react-redux에 내장되어있는 함수로서, 객체 안의 가장 겉에 있는 값들을 모두 비교해준다. (얕은비교)



```jsx
import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import Counter from '../components/Counter';
import { increase, decrease, setDiff } from '../modules/counter';

function CounterContainer() {
  // useSelector는 리덕스 스토어의 상태를 조회하는 Hook입니다.
  // state의 값은 store.getState() 함수를 호출했을 때 나타나는 결과물과 동일합니다.
  const { number, diff } = useSelector(
    state => ({
      number: state.counter.number,
      diff: state.counter.diff
    }),
    shallowEqual
  );

  (...)
```



```js
{
  number: state.counter.number,
  diff: state.counter.diff
}
```

반환결과인 이 객체에서

`number: state.counter.number`, `diff: state.counter.diff` 를 비교한다. 

이 녀석들은 state.counter의 내부값이기 때문에 값이 변하지 않았다면 동일한 메모리주소를 갖는다.



## 6.9. connect 함수

### connect 함수란?

[`connect`](https://react-redux.js.org/api/connect) 함수는 컨테이너 컴포넌트를 만드는 또 다른 방법이다. 하지만  `hook`이 잘 되어있기 때문에 앞으로 쓸일이 없을것이다.

9년 이전에 작성된 리덕스와 연동된 컴포넌트들은 `connect` 함수로 작성되었을 것이다. 그래서 교양정도로 한번 알아보면 좋을 긋 하다.



### HOC란?

`connect`는 [HOC](https://velopert.com/3537)이고,  HOC란, Higher-Order Component 를 의미한다.

HOC는 "컴포넌트를 특정 함수로 감싸서 특정 값 또는 함수를 props로 받아와서 사용 할 수 있게 해주는 패턴" 이다

(이러한 관점에서 보면 컨테이너 컴포넌트도 HOC가 아닐까!? 생각이 들었지만 컨테이너 컴포넌트는 순수함수가 아닌 컴포넌트이기도 하고 함수를 컴포넌트를 감싸는 형태가 아니기 때문에 아닌것 같다!)



#### hoc 예시

```js
const enhance = withState('counter', 'setCounter', 0)
const Counter = enhance(({ counter, setCounter }) =>
  <div>
    Count: {counter}
    <button onClick={() => setCounter(n => n + 1)}>Increment</button>
    <button onClick={() => setCounter(n => n - 1)}>Decrement</button>
  </div>
)
```

