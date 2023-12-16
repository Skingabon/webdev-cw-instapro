import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import {
  posts,
  goToPage,
  getToken,
  // updatePosts,
  page,
  user,
  // renderApp,
} from "../index.js";
import { postDelete } from "../api.js";

// export function renderPostsPageComponent({ appEl }) {
//   // TODO: реализовать рендер постов из api
//   console.log("Актуальный список постов:", posts);

//   /**
//    * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
//    * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
//    */
//   const postHtml = posts
//     .map((post) => {
//       return `

//       <li class="post">
//         <div class="post-header" data-user-id=${post.user.id}>
//             <img src=${post.user.imageUrl} class="post-header__user-image">
//             <p class="post-header__user-name">${post.user.name}</p>
//         </div>
//         <div class="post-image-container">
//           <img class="post-image" src=${post.imageUrl}>
//         </div>
//         <div class="post-likes">
//           <button data-post-id=${post.id}
//            class="like-button">
//             <img src="./assets/images/like-active.svg">
//           </button>
//           <p class="post-likes-text">
//             Нравится: <strong>${post.likes.length}</strong>
//           </p>
//         </div>
//         <p class="post-text">
//           <span class="user-name">${post.user.name}</span>
//           ${post.description}
//         </p>
//         <p class="post-date">
//           19 минут назад
//         </p>
//       </li>`;
//     })
//     .join("");

//   const appHtml = `<div class="page-container">
// <div class="header-container"></div>
// <ul class="posts">
//   ${postHtml}
// </ul>
// </div>`;
////////////////////////////////////////////////
export function renderPostsPageComponent({ appEl }) {
  // TODO: реализовать рендер постов из api
  console.log("Актуальный список постов:", posts);

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */

  const postHtml = posts
    .map((post) => {
      const userStorage = JSON.parse(window.localStorage.getItem("user"));
      const userStorageId = userStorage ? userStorage._id : null;
      const replaceFunction = (str) => {
        return str
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;");
      };
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
              ? `${post.likes[post.likes.length - 1].name} ${
                  post.likes.length - 1 > 0
                    ? "и ещё " + (post.likes.length - 1)
                    : ""
                }`
              : "0"
          }
          </p>
          <div class="delete-button-container">
          <button class="delete-button ${
            userStorage === null || post.user.id !== userStorageId
              ? "hidden"
              : ""
          }" id="button-delete" data-post-id="${post.postId}">Удалить</button>
        </div>

        </div>
        <p class="post-text">
          <span class="user-name">${post.user.name}</span>
          ${post.description}
        </p>
        <p class="post-date">
        ${post.createdAt} назад
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

  likeButtons.forEach((likeButton) => {
    likeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const postId = likeButton.dataset.postId;
      const index = likeButton.dataset.index;
      const postHeader = document.querySelector(".post-header");
      const userId = postHeader.dataset.userId;

      if (posts[index].isLiked) {
        removeLike({ token: getToken(), postId })
          .then(() => {
            posts[index].post.isLiked = false;
          })
          .then(() => {
            getPosts({ token: getToken(), userId }).then((response) => {
              if (page === USER_POSTS_PAGE) {
                updatePosts(response);
                goToPage(USER_POSTS_PAGE, {
                  userId,
                });
              } else {
                updatePosts(response);
                renderApp();
              }
            });
          });
      } else {
        addLike({ token: getToken(), postId })
          .then(() => {
            posts[index].isLiked = true;
          })
          .then(() => {
            getPosts({ token: getToken(), userId }).then((response) => {
              if (page === USER_POSTS_PAGE) {
                updatePosts(response);
                goToPage(USER_POSTS_PAGE, {
                  userId,
                });
              } else {
                updatePosts(response);
                renderApp();
              }
            });
          });
      }
    });
  });
}

export function likeImageEventListener() {
  const likeButtons = document.querySelectorAll(".post-image");

  likeButtons.forEach((likeButton) => {
    likeButton.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      const postId = likeButton.dataset.postId;
      const index = likeButton.dataset.index;
      const postHeader = document.querySelector(".post-header");
      const userId = postHeader.dataset.userId;

      if (posts[index].isLiked) {
        removeLike({ token: getToken(), postId })
          .then(() => {
            posts[index].isLiked = false;
          })
          .then(() => {
            getPosts({ token: getToken(), userId }).then((response) => {
              if (page === USER_POSTS_PAGE) {
                updatePosts(response);
                goToPage(USER_POSTS_PAGE, {
                  userId,
                });
              } else {
                updatePosts(response);
                renderApp();
              }
            });
          });
      } else {
        addLike({ token: getToken(), postId })
          .then(() => {
            posts[index].isLiked = true;
          })
          .then(() => {
            getPosts({ token: getToken(), userId }).then((response) => {
              if (page === USER_POSTS_PAGE) {
                updatePosts(response);
                goToPage(USER_POSTS_PAGE, {
                  userId,
                });
              } else {
                updatePosts(response);
                renderApp();
              }
            });
          });
      }
    });
  });
}

export function postDeleteEventListener() {
  const deleteButtons = document.querySelectorAll(".delete-button");

  deleteButtons.forEach((deleteButton) => {
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const postId = deleteButton.dataset.postId;
      const postElement = deleteButton.closest(".post");
      if (postElement) {
        const userId = postElement.querySelector(".post-header").dataset.userId;

        postDelete({ token: getToken(), postId }).then(() => {
          getPosts({ token: getToken(), userId }).then((response) => {
            if (page === USER_POSTS_PAGE) {
              updatePosts(response);
              goToPage(USER_POSTS_PAGE, {
                userId,
              });
            } else {
              updatePosts(response);
              renderApp();
            }
          });
        });
      }
    });
  });
}
