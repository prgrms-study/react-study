## 7.1. 리덕스 프로젝트 준비하기

> 리덕스 리마인드 하면서 셋업해봅시다.



### 리덕스 모듈

- Counter 리듀서

```js
// modules/counter.js

// 액션 타입
const INCREASE = 'INCREASE';
const DECREASE = 'DECREASE';

// 액션 생성 함수
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

// 초깃값 (상태가 객체가 아니라 그냥 숫자여도 상관 없습니다.)
const initialState = 0;

export default function counter(state = initialState, action) {
  switch (action.type) {
    case INCREASE:
      return state + 1;
    case DECREASE:
      return state - 1;
    default:
      return state;
  }
}
```



- 루트 리듀서

```js
// modules/index.js

import { combineReducers } from 'redux';
import counter from './counter';

const rootReducer = combineReducers({ counter });

export default rootReducer;
```



### 컴포넌트

- Counter 프레젠테이셔널 컴포넌트

```jsx
// components/Counter.js

import React from 'react';

function Counter({ number, onIncrease, onDecrease }) {
  return (
    <div>
      <h1>{number}</h1>
      <button onClick={onIncrease}>+1</button>
      <button onClick={onDecrease}>-1</button>
    </div>
  );
}

export default Counter;


```



- Counter 컨테이너 컴포넌트

```jsx
// containers/CounterContainer.js

import React from 'react';
import Counter from '../components/Counter';
import { useSelector, useDispatch } from 'react-redux';
import { increase, decrease } from '../modules/counter';

function CounterContainer() {
  const number = useSelector(state => state.counter);
  const dispatch = useDispatch();

  const onIncrease = () => {
    dispatch(increase());
  };
  const onDecrease = () => {
    dispatch(decrease());
  };

  return (
    <Counter number={number} onIncrease={onIncrease} onDecrease={onDecrease} />
  );
}

export default CounterContainer;
```



- index.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';

const store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

```



- App.jsx

```jsx
import React from 'react';
import CounterContainer from './containers/CounterContainer';

function App() {
  return <CounterContainer />;
}

export default App;
```



## 7.2. 미들웨어 만들어보고 이해하기

실무에서는 리덕스 미들웨어를 직접 만들일은 없다.

하지만 직접 만들어보면 리덕스 미들웨어가 어떤 역할인지 훨씬 이해할 수 있다.



### 리덕스 미들웨어 템플릿

리덕스 미들웨어를 만들 땐 다음과 같은 템플릿으로 작성한다.

```js
const middleware = store => next => action => {
  // 하고 싶은 작업...
}
```

##### 인자

- `store` : 리덕스 스토어 인스턴스로써 `store` 내부에는 `dispatch`, `getStore`, `subscribe` 내장함수들이 있다.

- `next` : 액션을 다음 미들웨어에게 전달하는 함수. `next(action)` 형태로 사용한다.  만약 다음 미들웨어가 없다면 리듀서에게 액션을 전달해준다. 만약 `next` 를 호출하지 않게 된다면 액션이 무시 처리되어 리듀서에게 전달되지 않는다.
- `action` : 현재 처리하고 있는 **액션객체** 



#### 동작방식

리덕스 스토어에 여러개의 미들웨어를 등록할 수 있다. 그리고 아래와 같은 형태로 동작한다.

![fZs5yvY](https://i.imgur.com/fZs5yvY.png)

- 새로운 액션이 디스패치되면 첫 번 째로 등록한 미들웨어가 호출된다.
- 만약 미들웨어에서 `next(action)` 을 호출하면 다음 미들웨어로 액션이 넘어간다.
- 만약 미들웨어에서 `store.dispatch`를 사용하면 다른 액션을 추가적으로 발생시킬 수 도 있다. 



### 미들웨어 직접 작성하기

- MyLogger 미들웨어

```js
// middlewares/myLogger.js

const myLogger = store => next => action => {
  console.log(action); // 먼저 액션을 출력합니다.
  const result = next(action); // 다음 미들웨어 (또는 리듀서) 에게 액션을 전달합니다.

  // 업데이트 이후의 상태를 조회합니다.
  console.log('\t', store.getState()); // '\t' 는 탭 문자 입니다.

  return result; // 여기서 반환하는 값은 dispatch(action)의 결과물이 됩니다. 기본: undefined
};

export default myLogger;
```



- index.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore, applyMiddleware } from 'redux'; //추가!
import { Provider } from 'react-redux';
import rootReducer from './modules';
import myLogger from './middlewares/myLogger'; // 추가!

const store = createStore(rootReducer, applyMiddleware(myLogger)); // 추가!

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```



- 결과

![ymhkBpD](https://i.imgur.com/ymhkBpD.png)



#### 미들웨어 안에서는 무엇이든지 할 수 있다.

- 액션 값을 객체가 아닌 함수도 받아오게 만들어서 액션이 함수타입이면 이를 실행시키게끔 할 수도 있다.
  - 이것이 `redux-thunk` 이다.



예시

```js
const thunk = store => next => action =>
  typeof action === 'function'
    ? action(store.dispatch, store.getState)
    : next(action)
```

이렇게 하면 다음과 같이 할 수 있다.

```js
const myThunk = () => (dispatch, getState) => {
  dispatch({ type: 'HELLO' });
  dispatch({ type: 'BYE' });
}

dispatch(myThunk());
```



이게 무엇인지는 `redux-thunk` 파트에서 알아보자.



## 7.3. redux-logger 사용 및 미들웨어와 DevTools 함께 사용하기

#### redux-logger란?

리덕스 관련 값들을 콘솔에 로깅하도록 도와주는 미들웨어



### 예제

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';
import myLogger from './middlewares/myLogger';
import logger from 'redux-logger';

const store = createStore(rootReducer, applyMiddleware(myLogger, logger)); 
// 여러개의 미들웨어를 적용 할 수 있습니다.

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
```



![M9CCIyp](https://i.imgur.com/M9CCIyp.png)

### Redux DevTools 사용하기

리덕스 미들웨어와 리덕스 데브툴스 함께 사용하는 방법에 대해 알아보자.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import rootReducer from './modules';
import myLogger from './middlewares/myLogger';
import logger from 'redux-logger';

// 단순하게 composeWithDevTools의 인자로 applyMiddleware를 넘겨주면 된다.
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(logger))
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

```



## 7.4 4. redux-thunk

### redux-thunk란?

redux-thunk를 사용하면 **액션 객체가 아닌 함수를 디스패치 할 수 있다.** 

일반적인 dispatch는 값을 반환하지만

dispatch를 실행하면서 다양한 함수의 동작을 하고싶을 때가 있을 것이다. 그리고 함수를 분리하고 싶을 때가 있을것이다.

**가장 유용하게 사용할 수 있는 케이스는 비동기 로직 이후에 dispatch를 하기 위할 때이다.**

> **일반적인 dispatch의 인자로 전달되는 액션생성함수는 `async/await` 을 적용할 수 없다.**

dispatch, 리듀서 로직에는 비동기로직이 없는 순수함수여야한다.

```js
const thunk = store => next => action =>
  typeof action === 'function'
    ? action(store.dispatch, store.getState)
    : next(action)
```

redux-thunk 또한 미들웨어이다. redux-thunk의 로직은 위와 같다.

인자 `action`  이 함수이면 `store.dispatch`, `store.getState` 를 인자로 넘겨서 실행을 시킨다.



>  함수를 디스패치 할 때에는, 
>
> 해당 함수에서 `dispatch` 와 `getState` 를 파라미터로 받아와주어야 한다.
>
> 이 함수를 **만들어주는 함수**를 우리는 thunk 라고 부른다.



### thunk의 사용 예시

```js
const getComments = () => (dispatch, getState) => {
  // 이 안에서는 액션을 dispatch 할 수도 있고
  // getState를 사용하여 현재 상태도 조회 할 수 있습니다.
  const id = getState().post.activeId;

  // 요청이 시작했음을 알리는 액션
  dispatch({ type: 'GET_COMMENTS' });

  // 댓글을 조회하는 프로미스를 반환하는 getComments 가 있다고 가정해봅시다.
  api
    .getComments(id) // 요청을 하고
    .then(comments => dispatch({ type: 'GET_COMMENTS_SUCCESS', id, comments })) // 성공시
    .catch(e => dispatch({ type: 'GET_COMMENTS_ERROR', error: e })); // 실패시
};
```



thunk함수에서 async/await을 사용해도 된다.

```js
const getComments = () => async (dispatch, getState) => {
  const id = getState().post.activeId;
  dispatch({ type: 'GET_COMMENTS' });
  try {
    const comments = await api.getComments(id);
    dispatch({ type:  'GET_COMMENTS_SUCCESS', id, comments });
  } catch (e) {
    dispatch({ type:  'GET_COMMENTS_ERROR', error: e });
  }
}
```



### 카운터앱에 적용해보기

- index.jsx

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import rootReducer from './modules';
import logger from 'redux-logger';
import ReduxThunk from 'redux-thunk';

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(ReduxThunk, logger)) // logger 를 사용하는 경우, logger가 가장 마지막에 와야합니다.
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
```



- Counter 리덕스 모듈

`increaseAsync`와 `decreaseAsync`라는 thunk 함수를 만들었다.

```js
// modules/counter.js

// 액션 타입
const INCREASE = 'INCREASE';
const DECREASE = 'DECREASE';

// 액션 생성 함수
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

// getState를 쓰지 않는다면 굳이 파라미터로 받아올 필요 없습니다.
export const increaseAsync = () => dispatch => {
  setTimeout(() => dispatch(increase()), 1000);
};
export const decreaseAsync = () => dispatch => {
  setTimeout(() => dispatch(decrease()), 1000);
};

// 초깃값 (상태가 객체가 아니라 그냥 숫자여도 상관 없습니다.)
const initialState = 0;

export default function counter(state = initialState, action) {
  switch (action.type) {
    case INCREASE:
      return state + 1;
    case DECREASE:
      return state - 1;
    default:
      return state;
  }
}

```



- Counter 컴테이너 컴포넌트

```jsx
import React from 'react';
import Counter from '../components/Counter';
import { useSelector, useDispatch } from 'react-redux';
import { increaseAsync, decreaseAsync } from '../modules/counter';

function CounterContainer() {
  const number = useSelector(state => state.counter);
  const dispatch = useDispatch();

  const onIncrease = () => {
    dispatch(increaseAsync());
  };
  const onDecrease = () => {
    dispatch(decreaseAsync());
  };

  return (
    <Counter number={number} onIncrease={onIncrease} onDecrease={onDecrease} />
  );
}

export default CounterContainer;
```

