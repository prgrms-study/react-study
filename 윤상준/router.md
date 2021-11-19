# 5.1

## 라우터

```jsx
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
```

BrowserRouter 컴포넌트를 이용해서 컴포넌트들을 감싸준다.

```jsx
import React from "react";
import { Route } from "react-router-dom";
import About from "./About";
import Home from "./Home";

const App = () => {
  return (
    <div>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </div>
  );
};

export default App;
```

path 속성으로 url 규칙을 넣어주면 된다. 이때 url 규칙이 맞게된다면 component를 렌더링 한다.

```jsx
<Route path="/" exact={true} component={Home} />
```

exact 속성을 안넣게 되면 '/about'으로 이동했을때 앞에 /이 있기 때문에 home컴포넌트와 about컴포넌트 둘다 렌더링이 된다.

```jsx
import { Link } from "react-router-dom";
<Link to="/about">소개</Link>;
```

Link 컴포넌트는 to 속성 안에 들어있는 url로 이동시키는 컴포넌트로 url을 직접 입력하지 않고 이동 할수 있다.
그럼 a태그를 그냥 쓰면 되지 왜 Link 컴포넌트를 쓸까?

# 5.2

## 파리미터와 쿼리

```
파라미터: /profiles/velopert
쿼리: /about?details=true
```

파라미터와 쿼리를 나누는 기준은 없지만 주요정보에는 파라미터, 옵션은 쿼리를 사용한다.

```jsx
const Profile = ({ match }) => {
  // 파라미터를 받아올 땐 match 안에 들어있는 params 값을 참조합니다.
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

export default Profile;
```

```jsx
<Route path="/profiles/:username" component={Profile} />
```

props.match은 url에 관한 정보를 담고 있다.

- params : 파리미터
- isExact : 정확히 일치하는 path인지
- path : router 컴포넌트 path의 값
- url : 전체 url
  여기서 params의 정보를 꺼내서 해당 정보를 이용할 수 있다.

props.location 에는 현재 url의 정보를 가지고 있다.

```jsx
{
  key: 'ac3df4', // not with HashHistory!
  pathname: '/somewhere'
  search: '?some=search-string',
  hash: '#howdy',
  state: {
    [userDefined]: true
  }
}
```

search라는 값이 query에 해당하는데 값이 string으로 되어있어서 정규표현식을 이용해야하지만 간단하게 객체로 만들 수 있다.

```bash
yarn add qs
```

```jsx
import React from "react";
import qs from "qs";

const About = ({ location }) => {
  const query = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
  const detail = query.detail === "true"; // 쿼리의 파싱결과값은 문자열입니다.

  return (
    <div>
      <h1>소개</h1>
      <p>이 프로젝트는 리액트 라우터 기초를 실습해보는 예제 프로젝트랍니다.</p>
      {detail && <p>추가적인 정보가 어쩌고 저쩌고..</p>}
    </div>
  );
};

export default About;
```

qs를 통해 쿼리를 string이 아닌 객체로 활용하여 값을 파싱 할 수 있다.
아마 key = value를 정규표현식으로 추출해서 객체로 만드는 방식을 하지 않았나 싶다.

# 5.3

## 서브 라우트

```jsx
import React from "react";
import { Link, Route } from "react-router-dom";
import Profile from "./Profile";

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

export default Profiles;
```

router내부에 router를 넣을 수 있다. 이것을 서브 라우터라고 한다.

# 5.4

## 리액트 라우터 부가기능

```jsx
function HistorySample({ history }) {
  const goBack = () => {
    history.goBack();
  };

  const goHome = () => {
    history.push("/");
  };

  useEffect(() => {
    console.log(history);
    const unblock = history.block("정말 떠나실건가요?");
    return () => {
      unblock();
    };
  }, [history]);

  return (
    <div>
      <button onClick={goBack}>뒤로가기</button>
      <button onClick={goHome}>홈으로</button>
    </div>
  );
}

export default HistorySample;
```

- history.goBack
  뒤로 가기 함수
- history.push(특정경로)
  특정 경로로 이동하는 함수
- history.block
  경로가 변경되었을때 한번 확인해주는 함수

```jsx
import React from "react";
import { withRouter } from "react-router-dom";
const WithRouterSample = ({ location, match, history }) => {
  return (
    <div>
      <h4>location</h4>
      <textarea value={JSON.stringify(location, null, 2)} readOnly />
      <h4>match</h4>
      <textarea value={JSON.stringify(match, null, 2)} readOnly />
      <button onClick={() => history.push("/")}>홈으로</button>
    </div>
  );
};

export default withRouter(WithRouterSample);
```

Router가 아닌 컴포넌트에서 location과 match를 사용하고 싶을때는 withRouter()의 인자로 넣어서 반환하면 된다.

```
withRouter 를 사용하면, 자신의 부모 컴포넌트 기준의 match 값이 전달됩니다. 보시면, 현재 gildong 이라는 URL Params 가 있는 상황임에도 불구하고 params 쪽이 {} 이렇게 비어있죠? WithRouterSample 은 Profiles 에서 렌더링 되었고, 해당 컴포넌트는 /profile 규칙에 일치하기 때문에 이러한 결과가 나타났습니다.???????????
```

```jsx
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
```

Swith컴포넌트로 감싸진 Route들은 일치하는 것 하나만 렌더링된다. 마지막에 아무것도 매치 되지 않을때는 404 페이지로 활용 할 수 있다.

```jsx
import React from "react";
import { Route, NavLink } from "react-router-dom";
import Profile from "./Profile";
import WithRouterSample from "./WithRouterSample";

const Profiles = () => {
  return (
    <div>
      <h3>유저 목록:</h3>
      <ul>
        <li>
          <NavLink
            to="/profiles/velopert"
            activeStyle={{ background: "black", color: "white" }}
          >
            velopert
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profiles/gildong"
            activeStyle={{ background: "black", color: "white" }}
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

export default Profiles;
```

NavLink는 Link와 비슷하지만 차이점으로 activeStyle과 activeClass등 해당 url이 일치할 경우 스타일 값 혹은 클래스를 적용한다.

# 5.5

## useReactRouter Hook 사용하기

```bash
 yarn add use-react-router
```

```jsx
import useReactRouter from "use-react-router";

function RouterHookSample() {
  const { history, location, match } = useReactRouter;
  console.log({ history, location, match });
  return null;
}

export default RouterHookSample;
```

withRouter가 불편할 경우 useReactRouter 라이브러리를 이용해서 편하게 사용할수 있지만 사용을 권장하고 있지 않다.
