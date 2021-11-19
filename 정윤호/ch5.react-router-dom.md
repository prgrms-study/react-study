## 5.1 프로젝트 준비 및 기본적인 사용법

> 참고
>
> https://velog.io/@ksmfou98/React-Router-v6-%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8-%EC%A0%95%EB%A6%AC
>
> https://velog.io/@soryeongk/ReactRouterDomV6



### 프로젝트에 라우터 적용

- index.jsx

```jsx
ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
```

프로젝트의 가장 최상단인 `index.jsx` 에서 `BrowserRouter` 를 적용하면 자식에서 라우팅 기능을 사용할 수 있다.



### Route: 특정 주소에 컴포넌트 연결하기

사용자가 요청하는 주소에 따라 다른 컴포넌트를 보여줄 때 `Route` 컴포넌트를 사용한다.

```jsx
<Route path="주소규칙" component={보여주고싶은 컴포넌트}>
<Route path="주소규칙" component={() => JSX}>
```

JSX 를 렌더링하는 방식은 상위 영역에서 props 나 기타 값들을 필요하면 전달 해 줄 수있다.

방법은?!





### Link: 누르면 다른 주소로 이동시키기

Link 컴포넌트는 클릭하면 다른 주소로 이동시키는 컴포넌트이다.

```jsx
<Link to='주소규칙' />
```



##### 다른주소로 이동하는 방법

- `<a href="...">...</a>`
  - 주의점으로는 페이지를 아예 새로 불러오기 때문에 리액트 앱이 지니고 있는 **상태들도 초기화**되고 **렌더링된 컴포넌트도 모두 사라진다.**
  - 사용 금지!
- `Link` 컴포넌트 사용
  - 브라우저의 주소만 바꿀뿐 페이지를 새로 불러오지는 않는다.



##### 사용예시

```jsx
import React from 'react';
import { Route, Link } from 'react-router-dom';
import About from './About';
import Home from './Home';

const App = () => {
  return (
    <div>
      <ul>
        <li>
          <Link to="/">홈</Link>
        </li>
        <li>
          <Link to="/about">소개</Link>
        </li>
      </ul>
      <hr />
      <Route path="/" exact={true} component={Home} />
      <Route path="/about" component={About} />
    </div>
  );
};

export default App;
```



## 5.2 파라미터와 쿼리

유동적인 페이지 주소를 정의할 때 파라미터와 쿼리 사용한다.


### 파리미터

파라미터는 특정 **id** 나 **이름**을 가지고 조회를 할 때 사용

```
/profiles/velopert
```



### 쿼리

쿼리는 어떤 **키워드**를 검색하거나, 요청을 할 때 필요한 **옵션**을 전달 할 때 사용

```
/about?details=true
```





> ⁉️ 이런 파리미터나 쿼리를 컴포넌트에서 받아오는 방법은 무엇일까?



### history, location, match

`<Route>` 로 렌더링된 컴포넌트는 props으로 `history`, `location`, `match` 를 받는다.



#### history

history 객체는 브라우저의 history api에 접근한다.

![history](/Users/uno/Desktop/history.png)

- `action`: 최근에 수행된 action(push, pop, replace)
- `block(propt)`: history 스택의 push와 pop 동작을 제어
- `go(n)`: history 스택의 포인터를 n으로 이동
- `goBack()`: 이전 페이지로 이동
- `goForward()`: 앞 페이지로 이동
- `length`: 전체 history 스택의 길이
- `location`: 현재 페이지의 정보
- `push(path, state)`: 새 경로를 history 스택에 push해서 페이지 이동
- `replace(path, state)`: 최근 경로를 histroy 스택에서 replace해서 페이지 이동



#### match

match 객체에는 Route path와 URL의 매칭에 대한 정보를 가지고 있다.

![match](/Users/uno/Desktop/match.png)



- `isExact`: `true`이면 경로가 완전히 정확할 경우에만 수행한다.
- `params`: 경로에 전달된 파라미터 값을 가진 객체
  - `<Route path="/profiles/:username" component={Profile} />` 에서 넘겨받은 파리미터 (사진에서는 `username`)
  - `path` : 현재 경로
  - `url` : 실제 경로
- `path`: Route에 정의된 경로
- `url`: 클라이언트로부터 실제 요청 받은 경로



#### location

location 객체는 현재 페이지에 대한 정보를 가지고 있다.

![location](/Users/uno/Desktop/location.png)

- `hash`: 현재 페이지의 hash 값
- `pathname`: 현재 페이지의 경로
- `search`: 현재 페이지의 hash 값 ( 이를 사용해서 url의 **query string**을 가져올 수 있다.)
  - 쿼리가 문자열형태로 되어있기 때문에 파싱이 필요
  - `qs` 라이브러리를 사용하면 쉽게 쿼리스트링을 객체로 파싱할 수 있다.



> 💡
> 컴포넌트에서
>
> 파라미터는 `match.params` 에서
>
> 쿼리는 `location.search` 에서 받아온다.



### 예제 - 파라미터는 `match.params` 에서 받아온다.

```jsx
const Profile = ({match}) => {
  const { username } = match.params;
  const profile = profileData[username];
  if (!profile) {
    return <div>존재하지 않는 유저입니다.</div>;
  }

  return (
    <div>
      <h3>
        {username}({profile.name})
      </h3>
      <p>{profile.description}</p>
    </div>
  );
};
```



### 예제- 쿼리는 `location.search` 에서 받아온다.

```jsx
import qs from 'qs';

const About = ({location}) => {

  const query = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
  const detail = query.detail === 'true';

  return (
    <div>
      <h1>소개</h1>
      <p>이 프로젝트는 리액트 라우터 기초를 실습해보는 예제 프로젝트랍니다.</p>
      {detail && <p>추가적인 정보가 어쩌고 저쩌고..</p>}
    </div>
  );
};
```



## 5.3 서브라우트

서브 라우트는, 라우트 내부의 라우트를 만드는것을 의미한다.
컴포넌트를 만들어서 그 안에 또 Route 컴포넌트를 렌더링하는 방식으로 구현한다.



```jsx
const Profiles = () => {
  return (
    <div>
      <h3>유저 목록:</h3>
      <ul>
        <li>
          <Link to="/profiles/velopert">velopert</Link>
        </li>
        <li>
          <Link to="/profiles/gildong">gildong</Link>
        </li>
      </ul>

      <Route
        path="/profiles"
        exact
        render={() => <div>유저를 선택해주세요.</div>}
      />
      <Route path="/profiles/:username" component={Profile} />
    </div>
  );
};
```



> ⁉️ 문제발견
>
> 이상하게 `Profiles` 컴포넌트에서 유저를 선택하면 렉이 걸려버린다..
> 무언가 무한 호출이 되는것 같은데...



## 5.4 리액트 라우터 부가기능



#### history

history 객체는 브라우저의 history api에 접근한다.

뒤로가기, 특정 경로로 이동, 이탈 방지 등..을 제어할 수 있다.

![history](/Users/uno/Desktop/history.png)

- `action`: 최근에 수행된 action(push, pop, replace)
- `block(propt)`: history 스택의 push와 pop 동작을 제어
- `go(n)`: history 스택의 포인터를 n으로 이동
- `goBack()`: 이전 페이지로 이동
- `goForward()`: 앞 페이지로 이동
- `length`: 전체 history 스택의 길이
- `location`: 현재 페이지의 정보
- `push(path, state)`: 새 경로를 history 스택에 push해서 페이지 이동
- `replace(path, state)`: 최근 경로를 histroy 스택에서 replace해서 페이지 이동



### 예제

```jsx
function HistorySample({ history }) {
  const goBack = () => {
    history.goBack();
  };

  const goHome = () => {
    history.push('/');
  };

  useEffect(() => {
    console.log(history);
    const unblock = history.block('정말 떠나실건가요?'); // 페이지떠나기 막기
    return () => {
      unblock(); // 페이지가 언마운트되려할 때 실행 componentWillUnmount
    };
  }, [history]);

  return (
    <div>
      <button onClick={goBack}>뒤로가기</button>
      <button onClick={goHome}>홈으로</button>
    </div>
  );
}
```





### withRouter HoC

withRouter HoC 는 라우트 컴포넌트가 아닌곳에서 match / location / history 를 사용해야 할 때 쓰면 된다.

###### 

```jsx
import React from 'react';
import { withRouter } from 'react-router-dom';
const WithRouterSample = ({ location, match, history }) => {
  return (
    <div>
      <h4>location</h4>
      <textarea value={JSON.stringify(location, null, 2)} readOnly />
      <h4>match</h4>
      <textarea value={JSON.stringify(match, null, 2)} readOnly />
      <button onClick={() => history.push('/')}>홈으로</button>
    </div>
  );
};

export default withRouter(WithRouterSample); // 요기!
```



withRouter 를 사용하면, 자신의 부모 컴포넌트 기준의 match / location / history를 전달받는다.



### Switch

Switch 는 여러 Route 들을 감싸서 그 중 규칙이 일치하는 라우트 단 하나만을 렌더링시켜준다.

Switch 를 사용하면, 아무것도 일치하지 않았을때 보여줄 Not Found 페이지를 구현 할 수도 있다.

> 궁금증
>
> 하지만 switch가 없어도 NotFoundPage 잘동작하는데...



```jsx
const App = () => {
  return (
    <div>
      <ul>
        <li>
          <Link to="/">홈</Link>
        </li>
        <li>
          <Link to="/about">소개</Link>
        </li>
        <li>
          <Link to="/profiles">프로필 목록</Link>
        </li>
        <li>
          <Link to="/history">예제</Link>
        </li>
      </ul>
      <hr />
      <Switch>
        <Route path="/" exact={true} component={Home} />
        <Route path="/about" component={About} />
        <Route path="/profiles" component={Profiles} />
        <Route path="/history" component={HistorySample} />
        <Route
          // path 를 따로 정의하지 않으면 모든 상황에 렌더링됨
          render={({ location }) => (
            <div>
              <h2>이 페이지는 존재하지 않습니다:</h2>
              <p>{location.pathname}</p>
            </div>
          )}
        />
      </Switch>
    </div>
  );
};
```

###### 

### NavLink

NavLink 는 Link 랑 비슷하다

만약 현재 경로와 `NavLink`에서 사용하는 경로가 일치하는 경우 **특정 스타일 혹은 클래스를 적용** 할 수 있는 컴포넌트이다.



```jsx
const Profiles = () => {
  return (
    <div>
      <h3>유저 목록:</h3>
      <ul>
        <li>
          <NavLink
            to="/profiles/velopert"
            activeStyle={{ background: 'black', color: 'white' }}
          >
            velopert
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profiles/gildong"
            activeStyle={{ background: 'black', color: 'white' }}
          >
            gildong
          </NavLink>
        </li>
      </ul>

      <Route
        path="/profiles"
        exact
        render={() => <div>유저를 선택해주세요.</div>}
      />
      <Route path="/profiles/:username" component={Profile} />
      <WithRouterSample />
    </div>
  );
};
```

만약에 스타일이 아니라 CSS 클래스를 적용하시고 싶으면 `activeStyle` 대신 `activeClassName` 을 사용하면 된다.



### Redirect

다른 주소로 보내주는 방법이다.

다만 Redirect는 push가 아닌 replace 방식이라 history에 남지 않는다.



```jsx

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        localStorage.getItem('users') ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/users/sign_in',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

```

만약 로그인 정보가 없다면 로그인 페이지로 이동



## 5.5. useReactRouter Hook 사용하기

라우터에 관련된 값들을 Hook 으로 사용하는 방법을 알아보자.

```bash
$ yarn add use-react-router
```



하지만 ...!

https://reactrouter.com/web/api/Hooks
React Route Hooks 업데이트 되었다고 한다.

### useReactRouter Hook 이란?

`withRouter` 를 사용하지 않고 현재 경로에 대한 match / location / history 를 사용할 수 있다.



```jsx
// import useReactRouter from 'use-react-router';
import {
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

function RouterHookSample() {
  // const { history, location, match } = useReactRouter;
  let history = useHistory();
  let location = useLocation();
  let params = useParams(); // 요건 빈객체가 나오던데...
  let match = useRouteMatch();
  console.log({ history, location, match, params });
  return null;
}

export default RouterHookSample;

```



![routerHook](/Users/uno/Desktop/routerHook.png)
