import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import {
  posts,
  goToPage,
  getToken,
  page,
  renderApp,
  user,
  setPosts,
  userId,
} from "../index.js";
import { addLike, getPosts, postDelete, removeLike, userPostsPage } from "../api.js";
import { addLikePost, replaceFunction } from "../helpers.js";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
////////////////////////////////////////////////
export function renderPostsUserComponent({ appEl }) {
  // TODO: реализовать рендер постов из api
  // console.log("Актуальный список постов:", posts);

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */

  const postHtml = posts
    .map((post) => {
      const userStorage = JSON.parse(window.localStorage.getItem("user"));
      const userStorageId = userStorage ? userStorage._id : null;
      return `
      <li class="post">
        <div class="post-header" data-user-id=${post.user.id}>
            <img src=${post.user.imageUrl} class="post-header__user-image">
            <p class="post-header__user-name">${replaceFunction(
              post.user.name
            )}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src=${post.imageUrl}>
        </div>
        <div class="post-likes">
          <button data-post-id=${post.id}
           class="like-button">
           <img src="${
             post.isLiked
               ? "./assets/images/like-active.svg"
               : "./assets/images/like-not-active.svg"
           }">
          </button>
          <p class="post-likes-text">
          Нравится: ${
            post.likes.length > 0
              ? `${replaceFunction(post.likes[post.likes.length - 1].name)} ${
                  post.likes.length - 1 > 0
                    ? "и ещё " + (post.likes.length - 1)
                    : ""
                }`
              : "0"
          }
          </p>
          <div class="delete-button-container">
          <button class="delete-button ${
            !user ? "hidden" : ""
          }" id="button-delete" data-post-id="${post.postId}">Удалить</button>
        </div>

        </div>
        <p class="post-text">
          <span class="user-name">${replaceFunction(post.user.name)}</span>
          ${post.description}
        </p>
        <p class="post-date">
        ${formatDistanceToNow(new Date(post.createdAt), { locale: ru })} назад
        </p>
      </li>`;
    })
    .join("");

  const appHtml = `<div class="page-container">
<div class="header-container"></div>
<ul class="posts">
  ${postHtml}
</ul>
</div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
  likeEventListener({ token: getToken() });
  likeImageEventListener({ token: getToken() });
  postDeleteEventListener({ token: getToken() });
}

export function likeEventListener() {
  const likeButtons = document.querySelectorAll(".like-button");

  likeButtons.forEach((likeButton, index) => {
    likeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const postId = likeButton.dataset.postId;

      addLikePost(postId, index, userPostsPage, userId);
    });
  });
}

export function likeImageEventListener() {
  const imagelikePosts = document.querySelectorAll(".post-image");
  const likeButtons = document.querySelectorAll(".like-button");

  imagelikePosts.forEach((postImage, index) => {
    postImage.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      const postId = likeButtons[index].dataset.postId;

      addLikePost(postId, index, userPostsPage, userId);
    });
  });
}

export function postDeleteEventListener() {
  const deleteButtons = document.querySelectorAll(".delete-button");
  const likeButtons = document.querySelectorAll(".like-button");

  deleteButtons.forEach((deleteButton, index) => {
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const postId = likeButtons[index].dataset.postId;

      postDelete({ token: getToken(), postId }).then(() => {
        getPosts({ token: getToken() }).then((response) => {
          setPosts(response);
          renderApp();
        });
        // renderApp();
      });
    });
  });
}
