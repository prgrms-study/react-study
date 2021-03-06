## 3장 투두리스트 만들기

### 컴포넌트 내부에서 태그 스타일

<table>
    <tr>
      <td align="top" width="50%">
     <img width="501" alt="111" src="https://user-images.githubusercontent.com/41064875/141964736-cf7ed3b0-d98f-4463-8e39-54a436c1cf96.png">
      </td>
      <td align="top" width="50%">
        <img width="703" alt="222" src="https://user-images.githubusercontent.com/41064875/141964748-be57d211-f967-4672-816f-cd23e619ed5f.png"
      </td>
    </tr>
  </table>

나는 보통 왼쪽으로 스타일링을 했다. 하지만 오른쪽의 예제처럼 태그의 구조가 복잡하지 않는 경우 container나 wrapper에서 자식 태그를 스타일링 하는 식으로 해도 괜찮은것 같다. 한 눈에 편해 보인다.

단 왼쪽처럼 작성하면 `className` 을 작성하지 않아도 되고 개발자도구에서는 클래스명이 복호화 되어있는 이점이 있다.

(적재적소)



### styled 안에서 사용자 정의 컴포넌트 스타일링

```jsx
const Remove = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #dee2e6;
  font-size: 24px;
  cursor: pointer;
  &:hover {
    color: #ff6b6b;
  }
  display: none;
`;

const TodoItemBlock = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  &:hover {
    ${Remove} {
      display: initial;
    }
  }
`;
```

단 호이스팅에 영향을 받기 때문에 선언 순서를 고려해야한다.





### display: initial

```jsx
const Remove = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #dee2e6;
  font-size: 24px;
  cursor: pointer;
  &:hover {
    color: #ff6b6b;
  }
  display: none;
`;

const TodoItemBlock = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  &:hover {
    ${Remove} {
      display: initial;
    }
  }
`;
```

` display: initial;` 이라는 속성 값을 처음 봤다.

> [CSS](https://developer.mozilla.org/ko/docs/Web/CSS) **`initial`** 키워드는 속성의 [초깃값(기본값)](https://developer.mozilla.org/ko/docs/Web/CSS/initial_value)을 요소에 적용합니다. 초깃값은 브라우저가 지정합니다. 모든 속성에서 사용할 수 있으며, [`all`](https://developer.mozilla.org/ko/docs/Web/CSS/all)에 지정할 경우 모든 CSS 속성을 초깃값으로 재설정합니다.
>
> [MDN참고자료](https://developer.mozilla.org/ko/docs/Web/CSS/initial)

예제의 경우  `Remove` 태그에 초기에 걸려있는 `display` 의 속성값, 즉 `flex`를 그대로 가져오는게 아닐까 생각이 든다.



### outline

> border의 외부선

![outline1](https://user-images.githubusercontent.com/41064875/141964768-4a19cd27-a2d3-4d2b-a597-b326d6254b5f.png)
![outline2](https://user-images.githubusercontent.com/41064875/141964770-5ff924ad-6916-428a-bc85-1f096c478f2d.png)



주로 input이 포커싱 되었을 때 강조되는 선이 outline이다

이런 outline은 border와 똑같 스타일 속성을 줄수 있다

```css
input {
  outline: 3px solid red;
  /* outline: none; */
}
```





### autoFocus

`input` 태그에 자동으로 포커스가 되도록 설정

```html
<Input autoFocus placeholder="할 일을 입력 후, Enter 를 누르세요" />
```





### 현재날짜 시간 구하기

#### 첫 번째 시도!

##### 💡 현재 날짜, 시간 구하기

```js
const today = new Date();

console.log(today)
// Sun May 30 2021 15:47:29 GMT+0900 (대한민국 표준시)
```

##### 📅 날짜 포맷팅

```js
const parseDate = (date) => {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1).slice(-2);
  const date = ('0' + date.getDate()).slice(-2);
  
  const week = ['일', '월', '화', '수', '목', '금', '토'];
 	const day = week[date.getDay()];
	
  return {
    year,
    month,
    date,
    day
  };
}
```

##### ⏰ 시간 포맷팅

```js
const parseTime = (date) => {
  const hours = ('0' + date.getHours()).slice(-2); 
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2); 
	
  return {
    hours,
    minutes,
    seconds,
  }
}
```



#### 강의내용! - toLocaleDateString

```js
dateObject.toLocaleDateString(locales[, Objectoptions]])
```



##### 지역언어(locales)

> 적용될 언어를 지정

- `'en-US'` 는 영어

-  `'ko-KR'` 은 한글



##### 옵션

> 반환 받을 속성(연도, 월, 시간 등등...)과 문자의 형식을 지정

- year: 연도를 나타냄
  - 'numeric'(예: 2020)
  - '2-digit'(예: 20)
- month: 월을 나타냄
  - 'numeric'(예: 5)
  - '2-digit'(예: 05)
  - 'long'(예: March)
  - 'short'(예: Mar)
  - 'narrow'(예: M)
- day: 일을 표현
  - 'numeric'(예: 1)
  - '2-digit'(예: 01)
- weekday: 요일을 표현
  - long'(예: Thursday)
  - 'short'(예: Thu)
  - 'narrow'(예: T)
- hour: 시간을 표현
  - 'numeric'(예: 1)
  - '2-digit'(예: 01)
- minute: 분을 표현
  - 'numeric'(예: 1)
  - '2-digit'(예: 01)
- second: 초를 표현
  - 'numeric'(예: 1)
  - '2-digit'(예: 01)





```js
const today = new Date();

const dateString = today.toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
console.log(dateString);
// 2021년 11월 16일

const dayName = today.toLocaleDateString('ko-KR', { weekday: 'long' });
console.log(dayName);
// 화요일
```





### 새로 배운 포인트

> context를 쪼갤수 있다.

```js
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
```



> 외부에서 ref.current를 변경할 수 있다.

```jsx
const TodoCreate = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const dispatch = useTodoDispatch();
  const nextId = useTodoNextId();

  const onToggle = () => setOpen(!open);
  const onChange = e => setValue(e.target.value);
  const onSubmit = e => {
    e.preventDefault();
    dispatch({
      type: 'CREATE',
      todo: {
        id: nextId.current,
        text: value,
        done: false,
      },
    });
    setValue('');
    setOpen(false);
    nextId.current += 1;
  };

  return (
    <>
      {open && (
        <InsertFormPositioner>
          <InsertForm onSubmit={onSubmit}>
            <Input
              autoFocus
              placeholder="할 일을 입력 후, Enter 를 누르세요"
              onChange={onChange}
              value={value}
            />
          </InsertForm>
        </InsertFormPositioner>
      )}
      <CircleButton onClick={onToggle} open={open}>
        <MdAdd />
      </CircleButton>
    </>
  );
};

```

