## 7.5. redux-thunk로 프로미스 다루기

 `post` 예제를 통해  redux-thunk를 사용하여 프로미스를 다루는 방법을 알아보자.

추가로 리액트 라우터도 구현!



### 가짜 api 준비

```js
// api/posts.js

// n 밀리세컨드동안 기다리는 프로미스를 만들어주는 함수
const sleep = n => new Promise(resolve => setTimeout(resolve, n));

// 가짜 포스트 목록 데이터
const posts = [
  {
    id: 1,
    title: '리덕스 미들웨어를 배워봅시다',
    body: '리덕스 미들웨어를 직접 만들어보면 이해하기 쉽죠.'
  },
  {
    id: 2,
    title: 'redux-thunk를 사용해봅시다',
    body: 'redux-thunk를 사용해서 비동기 작업을 처리해봅시다!'
  },
  {
    id: 3,
    title: 'redux-saga도 사용해봅시다',
    body:
      '나중엔 redux-saga를 사용해서 비동기 작업을 처리하는 방법도 배워볼 거예요.'
  }
];

// 포스트 목록을 가져오는 비동기 함수
export const getPosts = async () => {
  await sleep(500); // 0.5초 쉬고
  return posts; // posts 배열
};

// ID로 포스트를 조회하는 비동기 함수
export const getPostById = async id => {
  await sleep(500); // 0.5초 쉬고
  return posts.find(post => post.id === id); // id 로 찾아서 반환
};
```



### posts 리덕스 모듈 준비하기

프로미스를 다루는 리덕스 모듈을 다룰 땐 다음과 같은 사항을 고려한다.

1. 프로미스가 시작, 성공, 실패했을때 다른 액션을 디스패치해야한다.
2. 각 프로미스마다 thunk 함수를 만들어주어야 한다.
3. 리듀서에서 액션에 따라 로딩중, 결과, 에러 상태를 변경해주어야 한다.



### 리덕스 모듈 유틸

```js
// lib/asyncUtils.js

// Promise에 기반한 Thunk를 만들어주는 함수입니다.
export const createPromiseThunk = (type, promiseCreator) => {
  const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];

  // 이 함수는 promiseCreator가 단 하나의 파라미터만 받는다는 전제하에 작성되었습니다.
  // 만약 여러 종류의 파라미터를 전달해야하는 상황에서는 객체 타입의 파라미터를 받아오도록 하면 됩니다.
  // 예: writeComment({ postId: 1, text: '댓글 내용' });
  return param => async dispatch => {
    // 요청 시작
    dispatch({ type, param });
    try {
      // 결과물의 이름을 payload 라는 이름으로 통일시킵니다.
      const payload = await promiseCreator(param);
      dispatch({ type: SUCCESS, payload }); // 성공
    } catch (e) {
      dispatch({ type: ERROR, payload: e, error: true }); // 실패
    }
  };
};


// 리듀서에서 사용 할 수 있는 여러 유틸 함수들입니다.
export const reducerUtils = {
  // 초기 상태. 초기 data 값은 기본적으로 null 이지만
  // 바꿀 수도 있습니다.
  initial: (initialData = null) => ({
    loading: false,
    data: initialData,
    error: null
  }),
  // 로딩중 상태. prevState의 경우엔 기본값은 null 이지만
  // 따로 값을 지정하면 null 로 바꾸지 않고 다른 값을 유지시킬 수 있습니다.
  loading: (prevState = null) => ({
    loading: true,
    data: prevState,
    error: null
  }),
  // 성공 상태
  success: payload => ({
    loading: false,
    data: payload,
    error: null
  }),
  // 실패 상태
  error: error => ({
    loading: false,
    data: null,
    error: error
  })
};

// 비동기 관련 액션들을 처리하는 리듀서를 만들어줍니다.
// type 은 액션의 타입, key 는 상태의 key (예: posts, post) 입니다.
export const handleAsyncActions = (type, key) => {
  const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];
  return (state, action) => {
    switch (action.type) {
      case type:
        return {
          ...state,
          [key]: reducerUtils.loading()
        };
      case SUCCESS:
        return {
          ...state,
          [key]: reducerUtils.success(action.payload)
        };
      case ERROR:
        return {
          ...state,
          [key]: reducerUtils.error(action.payload)
        };
      default:
        return state;
    }
  };
};
```





### posts 리덕스 모듈

```js
// modules/posts.js

import * as postsAPI from '../api/posts'; // api/posts 안의 함수 모두 불러오기
import {
  createPromiseThunk,
  reducerUtils,
  handleAsyncActions
} from '../lib/asyncUtils';

/* 액션 타입 */

// 포스트 여러개 조회하기
const GET_POSTS = 'GET_POSTS'; // 요청 시작
const GET_POSTS_SUCCESS = 'GET_POSTS_SUCCESS'; // 요청 성공
const GET_POSTS_ERROR = 'GET_POSTS_ERROR'; // 요청 실패

// 포스트 하나 조회하기
const GET_POST = 'GET_POST';
const GET_POST_SUCCESS = 'GET_POST_SUCCESS';
const GET_POST_ERROR = 'GET_POST_ERROR';

// 아주 쉽게 thunk 함수를 만들 수 있게 되었습니다.
export const getPosts = createPromiseThunk(GET_POSTS, postsAPI.getPosts);
export const getPost = createPromiseThunk(GET_POST, postsAPI.getPostById);

// initialState 쪽도 반복되는 코드를 initial() 함수를 사용해서 리팩토링 했습니다.
const initialState = {
  posts: reducerUtils.initial(),
  post: reducerUtils.initial()
};

export default function posts(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
    case GET_POSTS_SUCCESS:
    case GET_POSTS_ERROR:
      // return handleAsyncActions(GET_POSTS, 'posts')(state, action);
      const postsReducer = handleAsyncActions(GET_POSTS, 'posts');
      return postsReducer(state, action);
    case GET_POST:
    case GET_POST_SUCCESS:
    case GET_POST_ERROR:
      return handleAsyncActions(GET_POST, 'post')(state, action);
    default:
      return state;
  }
}
```



### 루트 리듀서

```jsx
// modules/index.js

import { combineReducers } from 'redux';
import counter from './counter';
import posts from './posts';

const rootReducer = combineReducers({ counter, posts });

export default rootReducer;
```



### PostList 프리젠테이셔널 컴포넌트

```jsx
// components/PostList.js

import React from 'react';
import { Link } from 'react-router-dom';

function PostList({ posts }) {
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <Link to={`/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}

export default PostList;
```



### PostList 컨테이너 컴포넌트

```jsx
// containers/PostListContainer.js

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PostList from '../components/PostList';
import { getPosts } from '../modules/posts';

function PostListContainer() {
  const { data, loading, error } = useSelector(state => state.posts.posts);
  const dispatch = useDispatch();

  // 컴포넌트 마운트 후 포스트 목록 요청
  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;
  return <PostList posts={data} />;
}

export default PostListContainer;
```



### PostListPage

```jsx
// containers/PostListContainer.js

import React from 'react';
import PostListContainer from '../containers/PostListContainer';

function PostListPage() {
  return <PostListContainer />;
}

export default PostListPage;
```



### index

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

const store = createStore(
  rootReducer,
  // logger 를 사용하는 경우, logger가 가장 마지막에 와야합니다.
  composeWithDevTools(applyMiddleware(ReduxThunk, logger))
); // 여러개의 미들웨어를 적용 할 수 있습니다.

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
);
```



### Post 프레젠테이셔널 컴포넌트

```jsx
// components/Post.js

import React from 'react';

function Post({ post }) {
  const { title, body } = post;
  return (
    <div>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}

export default Post;
```



### Post 컨테이너 컴포넌트

```jsx
// containers/PostContainer.js

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPost } from '../modules/posts';
import Post from '../components/Post';

function PostContainer({ postId }) {
  const { data, loading, error } = useSelector(state => state.posts.post);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPost(postId));
  }, [postId, dispatch]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;

  return <Post post={data} />;
}

export default PostContainer;
```



### PostPage

```jsx
// pages/PostPage.js

import React from 'react';
import PostContainer from '../containers/PostContainer';

function PostPage({ match }) {
  const { id } = match.params; // URL 파라미터 조회하기

  // URL 파라미터 값은 문자열이기 때문에 parseInt 를 사용하여 숫자로 변환해주어야 합니다.
  return <PostContainer postId={parseInt(id, 10)} />;
}

export default PostPage;
```



### App

```jsx
import React from 'react';
import { Route } from 'react-router-dom';
import PostListPage from './pages/PostListPage';
import PostPage from './pages/PostPage';

function App() {
  return (
    <>
      <Route path="/" component={PostListPage} exact={true} />
      <Route path="/:id" component={PostPage} />
    </>
  );
}

export default App;
```





### 결과

![8a7uQJQ](https://i.imgur.com/8a7uQJQ.gif)



### 문제점

1. 특정 포스트를 열은다음에 뒤로 갔을 때, 포스트 목록을 또 다시 불러오게 되면서 로딩중...이 나타나게 된다.
2. 특정 포스트를 읽고, 뒤로 간 다음에 다른 포스트를 열면 이전에 열었던 포스트가 잠깐 보여졌다가 로딩중... 이 보여지게된다.
   - 굳이 리로딩할 필요가 없다.



## 7.6. API 재로딩 문제 해결하기

사용자에게 나쁜 경험을 제공 할 수 있는 API 재로딩 문제를 해결해보자.

### 

포스트 목록이 재로딩 되는 문제를 해결하는 방법은 두가지이다.

1.  만약 데이터가 이미 존재한다면 요청을 하지 않도록 하는 방법
   - 포스트 목록이 이미 있는데 재로딩하는 이슈를 제거할 수 있다.
2. 로딩을 새로하긴 하는데, 로딩중... 을 띄우지 않는 방법
   - 사용자에게 좋은 경험을 제공하면서도 뒤로가기를 통해 다시 포스트 목록을 조회 할 때 최신 데이터를 보여줄 수 있다



### 첫번째, 만약 데이터가 이미 존재한다면 요청을 하지 않도록 하는 방법

**PostListContainer**

```jsx
// containers/PostListContainer.js

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PostList from '../components/PostList';
import { getPosts } from '../modules/posts';

function PostListContainer() {
  const { data, loading, error } = useSelector(state => state.posts.posts);
  const dispatch = useDispatch();

  // 컴포넌트 마운트 후 포스트 목록 요청
  useEffect(() => {
    if (data) return;
    dispatch(getPosts());
  }, [data, dispatch]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;
  return <PostList posts={data} />;
}

export default PostListContainer;
```

`if (data) return;` 를 통해서 데이터가 존재한다면 데이터 요청 자체를 시작하지 않는다.



### 두번째, 로딩을 새로하긴 하는데, 로딩중... 을 띄우지 않는 방법

**handleAsyncActions**

```jsx
// lib/asyncUtils.js - handleAsyncActions.js

export const handleAsyncActions = (type, key, keepData = false) => {
  const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];
  return (state, action) => {
    switch (action.type) {
      case type:
        return {
          ...state,
          [key]: reducerUtils.loading(keepData ? state[key].data : null)
        };
      case SUCCESS:
        return {
          ...state,
          [key]: reducerUtils.success(action.payload)
        };
      case ERROR:
        return {
          ...state,
          [key]: reducerUtils.error(action.error)
        };
      default:
        return state;
    }
  };
};
```

`keepData` 라는 파라미터를 추가하여 만약 이 값이 `true`로 주어지면 로딩을 할 때에도 데이터를 유지하도록 수정을 해준다.



**posts 리듀서**

```jsx
// modules/posts.js - posts 리듀서

export default function posts(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
    case GET_POSTS_SUCCESS:
    case GET_POSTS_ERROR:
      return handleAsyncActions(GET_POSTS, 'posts', true)(state, action);
    case GET_POST:
    case GET_POST_SUCCESS:
    case GET_POST_ERROR:
      return handleAsyncActions(GET_POST, 'post')(state, action);
    default:
      return state;
  }
}
```

포스트 목록을 가지고 올 때 `keepDate` 인자 활성화



**PostListContainer**

```jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PostList from '../components/PostList';
import { getPosts } from '../modules/posts';

function PostListContainer() {
  const { data, loading, error } = useSelector(state => state.posts.posts);
  const dispatch = useDispatch();

  // 컴포넌트 마운트 후 포스트 목록 요청
  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  if (loading && !data) return <div>로딩중...</div>; // 로딩중이면서, 데이터가 없을 때에만 로딩중... 표시
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;

  return <PostList posts={data} />;
}

export default PostListContainer;
```

로딩중이면서 데이터가 null일 때만 로딩을 표시



### 포스트 조회시 재로딩 문제 해결하기

> - 포스트 페이지에서 떠날때마다 포스트를 비우게 되므로, 다른 포스트를 읽을 때 이전 포스트가 보여지는 문제
> - 이미 읽었던 포스트를 불러오려고 할 경우에도 새로 요청하는 문제

특정 포스트를 조회하는 과정에서 재로딩 문제를 해결하려면, 방금 했던 방식으로는 처리 할 수 없다. 

왜냐하면 어떤 파라미터가 주어졌냐에 따라 다른 결과물이 있기 때문이다.

이 문제를 해결하는 방식 또한 두가지이다.

1. 컴포넌트가 언마운트될 때 포스트 내용을 비우도록 하는 방법
2. 요청은 하지만 로딩중을 보여주지 않는 방법



### 첫번째, 컴포넌트가 언마운트될때 포스트 내용을 비우도록 하는 방법

**posts 리덕스 모듈에 CLEAR_POST 라는 액션 추가**

```jsx
// modules/posts.js

import * as postsAPI from '../api/posts'; // api/posts 안의 함수 모두 불러오기
import {
  createPromiseThunk,
  reducerUtils,
  handleAsyncActions
} from '../lib/asyncUtils';

/* 액션 타입 */

// 포스트 여러개 조회하기
const GET_POSTS = 'GET_POSTS'; // 요청 시작
const GET_POSTS_SUCCESS = 'GET_POSTS_SUCCESS'; // 요청 성공
const GET_POSTS_ERROR = 'GET_POSTS_ERROR'; // 요청 실패

// 포스트 하나 조회하기
const GET_POST = 'GET_POST';
const GET_POST_SUCCESS = 'GET_POST_SUCCESS';
const GET_POST_ERROR = 'GET_POST_ERROR';

// 포스트 비우기
const CLEAR_POST = 'CLEAR_POST';

// 아주 쉽게 thunk 함수를 만들 수 있게 되었습니다.
export const getPosts = createPromiseThunk(GET_POSTS, postsAPI.getPosts);
export const getPost = createPromiseThunk(GET_POST, postsAPI.getPostById);

export const clearPost = () => ({ type: CLEAR_POST });

// initialState 쪽도 반복되는 코드를 initial() 함수를 사용해서 리팩토링 했습니다.
const initialState = {
  posts: reducerUtils.initial(),
  post: reducerUtils.initial()
};

export default function posts(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
    case GET_POSTS_SUCCESS:
    case GET_POSTS_ERROR:
      return handleAsyncActions(GET_POSTS, 'posts', true)(state, action);
    case GET_POST:
    case GET_POST_SUCCESS:
    case GET_POST_ERROR:
      return handleAsyncActions(GET_POST, 'post')(state, action);
    case CLEAR_POST:
      return {
        ...state,
        post: reducerUtils.initial()
      };
    default:
      return state;
  }
}
```

이 작업을 하려면 posts 리덕스 모듈에 CLEAR_POST 라는 액션을 준비해주어야 한다.



```jsx
// containers/PostContainer.js

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPost, clearPost } from '../modules/posts';
import Post from '../components/Post';

function PostContainer({ postId }) {
  const { data, loading, error } = useSelector(state => state.posts.post);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPost(postId));
    return () => {
      dispatch(clearPost());
    };
  }, [postId, dispatch]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;

  return <Post post={data} />;
}

export default PostContainer;
```

이렇게 해주면, 포스트 페이지에서 떠날때마다 포스트를 비우게 되므로, 다른 포스트를 읽을 때 이전 포스트가 보여지는 문제가 해결된다.

**아직 아쉬운점! **
이미 읽었던 포스트를 불러오려고 할 경우에도 새로 요청하는것은 해결하지 못했다.

이 문제를 개선하려면, posts 모듈에서 관리하는 상태의 구조를 바꿔야 한다.

지금은 다음과 같이 이루어져있는데

```javascript
{
  posts: {
    data,
    loading,
    error
  },
  post: {
    data,
    loading,
    error,
  }
}
```

이를 다음과 같이 구성해야한다.

```javascript
{
  posts: {
    data,
    loading,
    error
  },
  post: {
    '1': {
      data,
      loading,
      error
    },
    '2': {
      data,
      loading,
      error
    },
    [id]: {
      data,
      loading,
      error
    }
  }
}
```

이를 진행하려면 기존에 asyncUtils 에 만든 여러 함수를 커스터마이징 해야하지만

기존 함수를 수정하는 대신에 새로운 이름으로 다음 함수들을 작성해주도록 한다.

1. createPromiseThunkById : 특정 id 를 처리하는 Thunk 생성함수
2. handleAsyncActionsById : id별로 처리하는 유틸함수



이제부터 비동기 작업에 관련된 액션이 어떤 id를 가르키는지 알아야 한다.

그렇게 하기 위해서 앞으로 action.meta 값에 id를 넣어주도록 한다.



**asyncUtils**

```jsx
// lib/asyncUtils.js

(...)


// 특정 id 를 처리하는 Thunk 생성함수
const defaultIdSelector = param => param;
export const createPromiseThunkById = (
  type,
  promiseCreator,
  // 파라미터에서 id 를 어떻게 선택 할 지 정의하는 함수입니다.
  // 기본 값으로는 파라미터를 그대로 id로 사용합니다.
  // 하지만 만약 파라미터가 { id: 1, details: true } 이런 형태라면
  // idSelector 를 param => param.id 이런식으로 설정 할 수 있곘죠.
  idSelector = defaultIdSelector
) => {
  const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];

  return param => async dispatch => {
    const id = idSelector(param);
    dispatch({ type, meta: id });
    try {
      const payload = await promiseCreator(param);
      dispatch({ type: SUCCESS, payload, meta: id });
    } catch (e) {
      dispatch({ type: ERROR, error: true, payload: e, meta: id });
    }
  };
};

// id별로 처리하는 유틸함수
export const handleAsyncActionsById = (type, key, keepData = false) => {
  const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];
  return (state, action) => {
    const id = action.meta;
    switch (action.type) {
      case type:
        return {
          ...state,
          [key]: {
            ...state[key],
            [id]: reducerUtils.loading(
              // state[key][id]가 만들어져있지 않을 수도 있으니까 유효성을 먼저 검사 후 data 조회
              keepData ? state[key][id] && state[key][id].data : null
            )
          }
        };
      case SUCCESS:
        return {
          ...state,
          [key]: {
            ...state[key],
            [id]: reducerUtils.success(action.payload)
          }
        };
      case ERROR:
        return {
          ...state,
          [key]: {
            ...state[key],
            [id]: reducerUtils.error(action.payload)
          }
        };
      default:
        return state;
    }
  };
};
```



**posts 리덕스 모듈**

```jsx
// modules/posts.js

import * as postsAPI from '../api/posts'; // api/posts 안의 함수 모두 불러오기
import {
  createPromiseThunk,
  reducerUtils,
  handleAsyncActions,
  createPromiseThunkById,
  handleAsyncActionsById
} from '../lib/asyncUtils';

/* 액션 타입 */

// 포스트 여러개 조회하기
const GET_POSTS = 'GET_POSTS'; // 요청 시작
const GET_POSTS_SUCCESS = 'GET_POSTS_SUCCESS'; // 요청 성공
const GET_POSTS_ERROR = 'GET_POSTS_ERROR'; // 요청 실패

// 포스트 하나 조회하기
const GET_POST = 'GET_POST';
const GET_POST_SUCCESS = 'GET_POST_SUCCESS';
const GET_POST_ERROR = 'GET_POST_ERROR';

// 아주 쉽게 thunk 함수를 만들 수 있게 되었습니다.
export const getPosts = createPromiseThunk(GET_POSTS, postsAPI.getPosts);
export const getPost = createPromiseThunkById(GET_POST, postsAPI.getPostById);

// initialState 쪽도 반복되는 코드를 initial() 함수를 사용해서 리팩토링 했습니다.
const initialState = {
  posts: reducerUtils.initial(),
  post: {}
};

export default function posts(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
    case GET_POSTS_SUCCESS:
    case GET_POSTS_ERROR:
      return handleAsyncActions(GET_POSTS, 'posts', true)(state, action);
    case GET_POST:
    case GET_POST_SUCCESS:
    case GET_POST_ERROR:
      return handleAsyncActionsById(GET_POST, 'post')(state, action);
    default:
      return state;
  }
}
```



 **PostContainer**

```jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPost } from '../modules/posts';
import Post from '../components/Post';

function PostContainer({ postId }) {
  const { data, loading, error } = useSelector(
    state => state.posts.post[postId]
  ) || {
    loading: false,
    data: null,
    error: null
  }; // 아예 데이터가 존재하지 않을 때가 있으므로, 비구조화 할당이 오류나지 않도록
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) return; // 포스트가 존재하면 아예 요청을 하지 않음
    dispatch(getPost(postId));
  }, [postId, dispatch, data]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;

  return <Post post={data} />;
}

export default PostContainer;
```

위 방식은 아예 요청을 하지 않는 방식으로 해결한 것이다.



### 두번째, 요청은 하지만 로딩중을 보여주지 않는 방법

**만약, 요청은 하지만 로딩중은 다시 보여주지 않는 방식으로 해결하려면???** 

리듀서와 PostContainer를 다음과 같이 수정한다.

#### modules/posts.js - posts

```javascript
export default function posts(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
    case GET_POSTS_SUCCESS:
    case GET_POSTS_ERROR:
      return handleAsyncActions(GET_POSTS, 'posts', true)(state, action);
    case GET_POST:
    case GET_POST_SUCCESS:
    case GET_POST_ERROR:
      return handleAsyncActionsById(GET_POST, 'post', true)(state, action); // keepData!
    default:
      return state;
  }
}
```

PostContainer는 다음과 같이 수정하면 됩니다.

#### containers/PostContainer.js

```jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPost } from '../modules/posts';
import Post from '../components/Post';

function PostContainer({ postId }) {
  const { data, loading, error } = useSelector(
    state => state.posts.post[postId]
  ) || {
    loading: false,
    data: null,
    error: null
  }; // 아예 데이터가 존재하지 않을 때가 있으므로, 비구조화 할당이 오류나지 않도록
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPost(postId));
  }, [dispatch, postId]);

  if (loading && !data) return <div>로딩중...</div>; // 로딩중이고 데이터 없을때만!!!
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;

  return <Post post={data} />;
}

export default PostContainer;
```





## 7.7 thunk에서 라우터 연동하기

프로젝트를 개발하다보면, thunk 함수 내에서 라우터를 사용해야 될 때도 있다. 

예를 들자면, 로그인 요청을 하는데 로그인이 성공 할 시 `/` 경로로 이동시키고, 실패 할 시 경로를 유지 하는 형태로 구현 하는 방식으로 말이다.



방법

1. 컨테이너 컴포넌트내에서 그냥 단순히 [withRouter](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/withRouter.md)를 사용해서 props 로 `history` 를 가져와서 사용
2. hunk에서 처리
   - thunk에서 처리를 하면 코드가 훨씬 깔끔해질 수 있다. (취향)



### customHistory 만들어서 적용하기

thunk 에서 라우터의 history 객체를 사용하려면, `BrowserHistory` 인스턴스를 직접 만들어서 적용해야한다.



index.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history'; // 요기!

const customHistory = createBrowserHistory(); // 요기!

const store = createStore(
  rootReducer,
  // logger 를 사용하는 경우, logger가 가장 마지막에 와야합니다.
  composeWithDevTools(
    applyMiddleware(
      ReduxThunk.withExtraArgument({ history: customHistory }), // 요기!
      logger
    )
  )
); // 여러개의 미들웨어를 적용 할 수 있습니다.

ReactDOM.render(
  <Router history={customHistory}> // 요기!
    <Provider store={store}>
      <App />
    </Provider>
  </Router>,
  document.getElementById('root')
);

serviceWorker.unregister();
```



`redux-thunk` 의 `withExtraArgument` 를 사용하면 thunk함수에서 사전에 정해준 값들을 참조 할 수 있다.



### 홈 화면으로 가는 thunk 만들기



#### modules/posts.js - goToHome

```jsx
// 3번째 인자를 사용하면 withExtraArgument 에서 넣어준 값들을 사용 할 수 있습니다.
export const goToHome = () => (dispatch, getState, { history }) => {
  history.push('/');
};
```

이게 바로 홈화면으로 가는 thunk



#### containers/PostContainer.js

```jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPost, goToHome } from '../modules/posts';
import Post from '../components/Post';

function PostContainer({ postId }) {
  const { data, loading, error } = useSelector(
    state => state.posts.post[postId]
  ) || {
    loading: false,
    data: null,
    error: null
  }; // 아예 데이터가 존재하지 않을 때가 있으므로, 비구조화 할당이 오류나지 않도록
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPost(postId));
  }, [dispatch, postId]);

  if (loading && !data) return <div>로딩중...</div>; // 로딩중이고 데이터 없을때만
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;

  return (
    <>
      <button onClick={() => dispatch(goToHome())}>홈으로 이동</button> // 요거 추가!
      <Post post={data} />
    </>
  );
}

export default PostContainer;
```

이제 PostContainer.js 에서 이 thunk 를 디스패치를한다.



**결과**

![qbkUppG](https://i.imgur.com/qbkUppG.gif)

지금은 단순히 다른 작업을 하지 않고 바로 홈으로 이동하게끔 했지만, 

실제 프로젝트에서는 `getState()` 를 사용하여 현재 리덕스 스토어의 상태를 확인하여 조건부로 이동을 하거나, 특정 API를 호출하여 성공했을 시에만 이동을 하는 형식으로 구현을 할 수 있다고 한다.





## 7.8 json-server

###  json-server란?

가짜 API 서버를 만드는 도구이다.

 json 파일 하나만 있으면 연습용 서버를 쉽게 구성 할 수 있다.





### 서버에서 제공할 데이터 준비

프로젝트 디렉토리 `data.json` 을 준비한다.

```jsx
{
  "posts": [
    {
      "id": 1,
      "title": "리덕스 미들웨어를 배워봅시다",
      "body": "리덕스 미들웨어를 직접 만들어보면 이해하기 쉽죠."
    },
    {
      "id": 2,
      "title": "redux-thunk를 사용해봅시다",
      "body": "redux-thunk를 사용해서 비동기 작업을 처리해봅시다!"
    },
    {
      "id": 3,
      "title": "redux-saga도 사용해봅시다",
      "body": "나중엔 redux-saga를 사용해서 비동기 작업을 처리하는 방법도 배워볼 거예요."
    }
  ]
}
```




이 파일을 기반으로 서버를 연다.

```bash
$ npx json-server ./data.json --port 4000
```

또는 json-server 를 글로벌로 설치해서 다음과 같이 사용 할 수도 있다.

```bash
$ yarn global add json-server
$ json-server ./data.json --port 4000
```





json-server 를 실행하시면 터미널에 다음과 같이 결과물이 다.

```javascript
  \{^_^}/ hi!

  Loading ./data.json
  Done

  Resources
  http://localhost:4000/posts

  Home
  http://localhost:4000
```

그러면 우리의 가짜 API 서버가 4000 포트로 열린다.

- http://localhost:4000/posts
- http://localhost:4000/posts/1