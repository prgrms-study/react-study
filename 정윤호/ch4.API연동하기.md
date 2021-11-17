## 4.1 API 연동의 기본

### axios

```js
import axios from 'axios';

// get
axios.get('/users/1');

// post
// 데이터를 등록 할 때에는 두번째 파라미터에 등록하고자 하는 정보를 넣을 수 있다.
axios.post('/users', {
  username: 'blabla',
  name: 'blabla'
});

```



그밖에....

```js
axios.request(config)
axios.get(url[, config])
axios.delete(url[, config])
axios.head(url[, config])
axios.options(url[, config])
axios.post(url[, data[, config]])
axios.put(url[, data[, config]])
axios.patch(url[, data[, config]])
```





### API 요청에 대한 상태를 관리

API 요청에 대한 상태를 관리 할 때에는 다음과 같이 총 3가지 상태를 관리해주어야 한다.

- 요청의 결과
- 로딩 상태
- 에러



```jsx
const Users = () => {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setError(null);
      setUsers(null);
      setLoading(true);
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/users'
      );
      setUsers(response.data);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!users) return null;
  return (
    <>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} ({user.name})
          </li>
        ))}
      </ul>
      <button onClick={fetchUsers}>다시 불러오기</button>
    </>
  );
};
```





### useEffect의  aynsc 콜백함수

`useEffect` 에 첫번째 파라미터로 등록하는 콜백함수에는 async 를 사용 할 수 없다.

따라서 아래 2가지중 한가지를 선택하여 비동기 함수를 사용해야한다.

- 함수 내부에서 async 함수를 선언하여 호출하기
- 함수 외부에서 async 함수를 선언하여 호출하기



## 4.2 useReducer로 요청 상태 관리

### `useReducer` 로 구현했을 때의 장점

- `useState` 의 `setState` 함수를 여러번 사용하지 않아도 된다.
  - `reducer` 안에 모든 로직을 응집시킬수 있기 때문 

- 리듀서로 로직을 분리했으니 다른곳에서도 쉽게 재사용을 할 수 있다.
  - `reducer`  에 필요한 로직을 모아 놓으면 `dispatch` 하나로 어디서든 내가 정의한 상태와 관련된 로직을 재상용할 수 있다.



```jsx
import React, { useEffect, useState, useReducer } from 'react';
import axios from 'axios';

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return {
        loading: true,
        data: null,
        error: null,
      };
    case 'SUCCESS':
      return {
        loading: false,
        data: action.data,
        error: null,
      };
    case 'ERROR':
      return {
        loading: false,
        data: null,
        error: action.error,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

const Users = () => {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    data: null,
    error: null,
  });


  const fetchUsers = async () => {
    dispatch({ type: 'LOADING' });
    try {
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/users'
      );
      dispatch({ type: 'SUCCESS', data: response.data });
    } catch (e) {
      dispatch({ type: 'ERROR', error: e });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const { loading, data: users, error } = state;

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!users) return null;
  return (
    <>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} ({user.name})
          </li>
        ))}
      </ul>
      <button onClick={fetchUsers}>다시 불러오기</button>
    </>
  );
};

export default Users;

```





## 4.3. useAsync 커스텀 Hook 만들어서 사용하기

데이터를 요청해야 할 때마다 리듀서를 작성하는 것은 번거로운 일 이다.

매번 반복되는 코드를 작성하는 대신에, 커스텀 Hook 을 만들어서 요청 상태 관리 로직을 쉽게 재사용하는 방법을 알아보자.



### useAsync.js

```jsx
import { useReducer, useEffect } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return {
        loading: true,
        data: null,
        error: null,
      };
    case 'SUCCESS':
      return {
        loading: false,
        data: action.data,
        error: null,
      };
    case 'ERROR':
      return {
        loading: false,
        data: null,
        error: action.error,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function useAsync(callback, deps = []) {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    data: null,
    error: false,
  });

  const fetchData = async () => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await callback();
      dispatch({ type: 'SUCCESS', data });
    } catch (e) {
      dispatch({ type: 'ERROR', error: e });
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, deps);

  return [state, fetchData];
}

export default useAsync;

```



### useAsync의 역할

API 요청(비동기 요청)에 대한 상태를 관리 할 때 다루어야하는 아래와 같은 3가지 상태를 관리하여 반환한다.

- 요청의 결과
- 로딩 상태
- 에러

이렇게 따로 훅으로 뽑아놓으면 API 요청(비동기 요청)을 사용하는 곳에서 재상용이 가능하다.



### Users.jsx

```jsx
import React from 'react';
import axios from 'axios';
import useAsync from './useAsync';

async function getUsers() {
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/users'
  );
  return response.data;
}

function Users() {
  const [state, refetch] = useAsync(getUsers, []);

  const { loading, data: users, error } = state; // state.data 를 users 키워드로 조회

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!users) return null;
  return (
    <>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} ({user.name})
          </li>
        ))}
      </ul>
      <button onClick={refetch}>다시 불러오기</button>
    </>
  );
}

export default Users;
```



## 4.4. react-async 로 요청 상태 관리하기

###  react-async란?

[react-async](https://github.com/ghengeveld/react-async) 는 우리가 만들었던 `useAsync` 함수가 내장되어있다.

```js
async function getUser({ id }) {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  return response.data;
}


const User = () => {
	 const { data: user, error, isLoading } = useAsync({
    promiseFn: getUser,
    id,
    watch: id
  });
	...
}
```



##### 인자에 넣을 객체 

- `promiseFn` : 호출 할 함수
  - `promiseFn` 에 들어갈 인자의 필드(키)와 값
- `watch` : 특정 값을 넣어주면 이 값이 바뀔 때마다 `promiseFn` 에 넣은 함수를 다시 호출해준다.



##### 반환 값

- `data` : 비동기 요쳥에 대한 결과
- `error` : 비동기 요청 실패시 true를 반환
- `isLoading` : 비동기 요청하는 동안 true를 반환
- `reload` : 비동기 요청을 재요청 하는 함수



##### 특정 인터랙션에 따라 API 를 호출하고 싶을 때의 인자와 반환값

- `deferFn` : 호출할 함수 (`promiseFn` 을 대체)
- `run` : 호출할 함수를 재요청 하는 함수



### 마치며

이전에 직접 만들었던 `useAsync` 와 크게 다를 건 없다.

우리가 만든것은 옵션이 굉장히 간단해서 사용이 편할 수 있다.

반면에 react-async 의 `useAsync` 는 옵션이 다양하고 결과 값도 객체 안에 다양한 값이 들어있어서 헷갈릴 수 있는 단점이 있다.

하지만 다양한 기능이 이미 내장되어있고 Hook 을 직접 만들 필요 없이 바로 불러와서 사용 할 수 있는 측면에서는 편하다.



## 4.5. Context와 함께 사용하기



같이 톺아보아요...!!