# 5.1

## 리덕스에서 사용되는 키워드

### Action

```jsx
{
  type: "ADD_TODO",
  data: {
    id: 0,
    text: "리덕스 배우기"
  }
}

```

action은 어떤 상태를 변경할때 같이 보내는 객체이다.type은 필수적으로 들어가야 한다. 나머지 값은 원하는 대로 넣을 수 있다.

### Action Creator

```jsx
export function addTodo(data) {
  return {
    type: "ADD_TODO",
    data,
  };
}

// 화살표 함수로도 만들 수 있습니다.
export const changeInput = (text) => ({
  type: "CHANGE_INPUT",
  text,
});
```

액션 객체를 리터럴로 직접 생성하는 것보다 액션 객체를 생성하는 함수를 만드는게 좋다.

### Reducer

Reducer는 변화를 일으키는 함수이다.

```jsx
function counter(state, action) {
  switch (action.type) {
    case "INCREASE":
      return state + 1;
    case "DECREASE":
      return state - 1;
    default:
      return state;
  }
}
```

Reducer는 두개의 인자를 받는다. 상태와 액션객체를 받아서 액션 객체의 타입에 따라 상태를 반환하여 상태를 변경한다.

### Store

상태,내장함수,Reducer를 저장하는 Store로 하나의 Store를 가진다.

### Dispatch

Store의 내장함수로 액션을 발생시킨다.

### Subscribe

useEffect처럼 특정 조건에서 콜백함수를 실행한다. Store의 내장함수로 action이 Dispatch를 통해 발생되었을때 실행된다.

# 5.2

## 리덕스의 3가지 규칙

### 하나의 애플리케이션에는 하나의 Store를 가진다.

### 상태는 읽기 전용이다.

상태의 값을 직접적으로 변경하지말고 상태의 변수는 읽을때만 사용하고 상태를 변경시키는 로직을 분리하라는 뜻이다.

### 변화를 일으키는 함수 Reducer는 순수함수이다.

직접적으로 외부의 상태를 변경하는 것이 아니라 새로운 상태를 반환함으로써 상태를 변경하라는 뜻이다.

# 5.3

## 리덕스 사용 준비

```jsx
import { createStore } from "redux";

const initialState = {
  count: 0,
  text: "",
  list: [],
};

const INCREASE = "INCREASE";
const DECREASE = "DECREASE";
const CHANGE_TEXT = "CHANGE_TEXT";
const ADD_TO_LIST = "ADD_TO_LIST";

const increase = () => {
  return {
    type: INCREASE,
  };
};

const decrease = () => {
  return {
    type: DECREASE,
  };
};

const changeText = (text) => {
  return {
    type: CHANGE_TEXT,
    text,
  };
};

const addToList = (item) => {
  return {
    type: ADD_TO_LIST,
    item,
  };
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case INCREASE:
      return {
        ...state,
        count: state.count + 1,
      };
    case DECREASE:
      return {
        ...state,
        count: state.count - 1,
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

const store = createStore(reducer);

const listener = () => {
  const state = store.getState();
  console.log(state);
};

const unsubscribe = store.subscribe(listener);

store.dispatch(increase());
store.dispatch(decrease());
store.dispatch(changeText("안녕하세요"));
store.dispatch(addToList({ id: 1, text: "와우" }));
```

useReducer와 매우 비슷하다. 차이점이라고 하면 store 내장 함수인 subscribe()를 통해 dispatch로 action이 발생했을때마다 실행하는 함수를 넣어주고 store.subscribe를 제거하는 함수를 반환한다.

# 5.4

## 리덕스 모듈 만들기

```jsx
import { combineReducers } from "redux";
import counter from "./counter";
import todos from "./todos";

const rootReducer = combineReducers({
  counter,
  todos,
});

export default rootReducer;
```

만들어진 reducer는 combineRedicers 함수를 이용하여 하나의 reducer로 만든다.

```bash
yarn add react-redux
```

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import App from "./App";
import rootReducer from "./modules";
const store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
```

redux를 react에서 사용하기 위해서는 react-redux를 설치해아한다. 설치 한 뒤에 Provider 컴포넌트에 store속성값으로 만들어진 store를 넣은뒤 값으로 전달하고 컴포넌트를 감싸면 해당 컴포넌트 내부에 있는 컴포넌트들이 자유롭게 redux에 접근할 수 있다.

# 5.5

## 카운터 구현하기

### 프레젠테이션 컴포넌트

컴포넌트의 상태를 store에서 가져오지 않고 받은 prop만을 사용하는 컴포넌트

```jsx
const SET_DIFF = "counter/SET_DIFF";
const INCREASE = "counter/INCREASE";
const DECREASE = "counter/DECREASE";

export const setDiff = (diff) => ({ type: SET_DIFF, diff });
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

const initialState = {
  number: 0,
  diff: 1,
};

export default function counter(state = initialState, action) {
  switch (action.type) {
    case SET_DIFF:
      return {
        ...state,
        diff: action.diff,
      };
    case INCREASE:
      return {
        ...state,
        number: state.number + 1,
      };
    case DECREASE:
      return {
        ...state,
        number: state.number - 1,
      };
    default:
      return state;
  }
}
```

```jsx
import { combineReducers } from "redux";
import counter from "./counter";
import todos from "./todos";

const rootReducer = combineReducers({
  counter,
  todos,
});

export default rootReducer;
```

```jsx
import React from "react";

function Counter({ number, diff, onIncrease, onDecrease, onSetDiff }) {
  const onChange = (e) => {
    console.log(e.target.value);
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

```jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Counter from "../components/Counter";
import { increase, decrease, setDiff } from "../modules/counter";

function CounterContainer() {
  const { number, diff } = useSelector((state) => ({
    number: state.counter.number,
    diff: state.counter.diff,
  }));
  const dispatch = useDispatch();

  const onIncrease = () => dispatch(increase());
  const onDecrease = () => dispatch(decrease());
  const onSetDiff = (diff) => dispatch(setDiff(diff));

  return (
    <Counter
      number={number}
      diff={diff}
      onIncrease={onIncrease}
      onDecrease={onDecrease}
      onSetDiff={onSetDiff}
    />
  );
}

export default CounterContainer;
```

프레젠테이션 컴포넌트 와 store에서 상태를 가져와 프레젠테이션 컴포넌트로 전달하는 컨테이너 컴포넌트를 분리해서 작성하는게 좋다.
