import Fuse from "fuse.js";

async function getPosts() {
  try {
    const res = await fetch("/posts.json");
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
}

async function retrieveSearchResults(query) {
  const posts = await getPosts();
  const fuse = new Fuse(posts, {
    keys: ["title", "description", "tags"],
    includeScore: true,
    shouldSort: true,
    includeMatches: true,
    minMatchCharLength: 3,
    threshold: 0.3,
  });
  const searchResults = fuse.search(query);
  return searchResults;
}

function generatePostHTML(post) {
  return `
    <article>
      <h2><a href="${post.item.href}">${post.item.title}</a></h2>
      <p>${post.item.description}</p>
      <a class="btn" href="${post.item.ref}">Read Post</a>
    </article>
  `;
}

const form = document.querySelector("#search-form");
const searchResults = document.querySelector("#search-results");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const query = formData.get("search");
  const postsToDisplay = await retrieveSearchResults(query);
  searchResults.innerHTML =
    postsToDisplay.length > 0
      ? postsToDisplay.map(generatePostHTML).join("")
      : "No results found";
});
