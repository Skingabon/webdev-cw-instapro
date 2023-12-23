import { setPosts } from "./index.js";

// "боевая" версия инстапро лежит в ключе prod
const personalKey = "prodMy";

//"https://wedev-api.sky.pro";

const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

// https://github.com/GlebkaF/webdev-hw-api/blob/main/pages/api/user/README.md#%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%D1%81%D1%8F
export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

export function uploadPost({ token, imageUrl }) {
  const descriptionElement = document.getElementById("description");
  return fetch(postsHost, {
    method: "POST",
    body: JSON.stringify({
      description: descriptionElement.value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;"),
      imageUrl,
    }),
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 400) {
      alert("Добавьте описание и фото");
      throw new Error("Часть данных не заполнена");
    } else {
      return response.json();
    }
  });
}

export function addLike({ token, postId }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      alert("Авторизуйтесь, чтобы поставить лайк");
      throw new Error("Not authorized");
    }
    return response.json();
  });
}

export function removeLike({ token, postId }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      alert("Авторизуйтесь, чтобы убрать лайк");
      throw new Error("Not authorized");
    }
    return response.json();
  });
}

export function postDelete({ token, postId }) {
  return fetch(`${postsHost}/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      alert("Авторизуйтесь, чтобы удалить пост");
      throw new Error("Not authorized");
    }

    return response.json();
  });
}

export function userPostsPage({ token, userId }) {
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 500) {
        throw new Error("The server has failed");
      } else if (response.status === 401) {
        throw new Error("Not authorized");
      } else {
        return response.json();
      }
    })
    .then((data) => {
      setPosts(data.posts);
      return data.posts;
    })
    .catch((error) => {
      alert("Something went wrong, try to enter again");
      console.warn(error);
    });
}
