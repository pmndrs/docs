<!-- ---
nav: 10
--- -->

## `useSnapshot(state)` without property access will always trigger re-render

https://github.com/pmndrs/valtio/issues/209#issuecomment-896859395

Suppose we have this state (or store).

```js
const state = proxy({
  obj: {
    count: 0,
    text: 'hello',
  },
})
```

If using the snapshot with accessing count,

```js
const snap = useSnapshot(state)
snap.obj.count
```

it will re-render only if `count` changes.

If the property access is obj,

```js
const snap = useSnapshot(state)
snap.obj
```

then, it will re-render if `obj` changes. This includes `count` changes and `text` changes.

Now, we can subscribe to the portion of the state.

```js
const snapObj = useSnapshot(state.obj)
snapObj
```

This is technically same as the previous one. It doesn't touch the property of `snapObj`, so it will re-render if `obj` changes.

In summary, if a snapshot object (nested or not) is not accessed with any properties, it assumes the entire object is accessed, so any change inside the object will trigger re-render.

## Object.keys

`Object.keys(state.obj)` doesn't touch any object properties, so the same as above.

It's possible to use non-proxy rendering:

```js
const [keys, setKeys] = useState([]);
useEffect(() => {
  const callback = () => {
    const next = Object.keys(state.obj);
    setKeys((prev) => (prev.length === next.length && prev.every((k) => next.includes(k)) ? prev: next);
  }
  const unsubscribe = subscribe(state.obj, callback);
  callback(); // run just once
  return unsubscribe;
}, [])
```

## Using `React.memo` with object props may result in unexpected behavior

The `snap` variable returned by `useSnapshot(state)` is tracked for render optimization.
If you pass the `snap` or some objects in `snap` to a component with `React.memo`,
it may not work as expected because `React.memo` can skip touching object properties.

Side note: [react-tracked](https://react-tracked.js.org) has a special `memo` exported as a workaround.

We have two options:
a) Do not use `React.memo`.
b) Do not pass objects to components with `React.memo` (pass primitive values instead).

```jsx
const ChildComponent = React.memo(
  ({
    title, // string or any primitive values are fine.
    description, // string or any primitive values are fine.
    // obj, // objects should be avoided.
  }) => (
    <div>
      {title} - {description}
    </div>
  )
)

const ParentComponent = () => {
  const snap = useSnapshot(state)
  return (
    <div>
      <ChildComponent title={snap.obj.title} description={snap.obj.description} />
    </div>
  )
}
```
