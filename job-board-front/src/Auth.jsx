const API_URL = import.meta.env.VITE_API_URL;

export function login(email, password) {
  let token = "";

  return fetch(API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, password: password }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error();
      }
      return res.json();
    })
    .then((data) => {
      token = data.token;
      return fetch(API_URL + "/auth/me", {
        headers: { Authorization: "Bearer " + token },
      });
    })
    .then((res) => res.json())
    .then((user) => ({ ...user, token: token }));
}