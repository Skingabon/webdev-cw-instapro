import { getToken, goToPage, posts, renderApp, setPosts } from "./index.js";
import { addLike, removeLike } from "./api.js";
import { POSTS_PAGE } from "./routes.js";

export function saveUserToLocalStorage(user) {
  window.localStorage.setItem("user", JSON.stringify(user));
} //функция кладет в LocalStorage ключ USER и данные о нем (токен, логин, пароль и т.д) Заметь, что используется JSON.stringify, чтобы передаваемый объект превратить в JSON и положить в LocalStorage

export function getUserFromLocalStorage(user) {
  try {
    return JSON.parse(window.localStorage.getItem("user"));
  } catch (error) {
    return null; // user{} || null
  }
} // функция вытаскивает из LocalStorage данные о USER, чтобы мы могли понять авторизован пользователь приложения или нет - поэтому используем конструкцию try catch - если в LocalStorageничего не лежит, то мы не сможем получить данные о USER и получим ошибку, а catch не даст обвалиться приложению и вернут NULL (user{} || null)

export function removeUserFromLocalStorage(user) {
  window.localStorage.removeItem("user");
}

export const replaceFunction = (str) => {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
};

export function addLikePost(postId, index, getPosts, userId = null) {
  const propsToApi = userId ? {token: getToken(), userId} : {token: getToken() }
  
  if (posts[index].isLiked) {
    removeLike({ token: getToken(), postId }).then(() => {
      posts[index].isLiked = false;
      getPosts(propsToApi).then((newPosts) => {
        setPosts(newPosts);
        renderApp();
      });
      
    });
  } else {
    addLike({ token: getToken(), postId }).then(() => {
      posts[index].isLiked = true;
      getPosts(propsToApi).then((newPosts) => {
        setPosts(newPosts);
        renderApp();
      });
    });
  }
}

