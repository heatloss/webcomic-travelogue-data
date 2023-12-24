let allComicsListings = {};
// let comicsdata = [];
// let genresdata = [];
// let tagsdata = [];
// let updatesdata = [];

const getAllComicsListings = async () => {
  const endpoints = ["titles", "genres", "tags", "updates"];
  const comicListings = await Promise.all(
    endpoints.map(async (endpoint) => {
      const resp = await fetch("/" + endpoint);
      return resp.json();
    })
  );
  const allComicsListingsObj = Object.fromEntries(
    endpoints.map((endpoint, i) => [endpoint, comicListings[i]])
  );
  return allComicsListingsObj;
};

const renderComicTitles = async (comicTitles) => {
  const tagArea = document.querySelector("#comicarea");
  const tagFragment = document.createDocumentFragment();
  comicTitles.forEach((title) => {
    const tagLi = document.createElement("li");
    tagLi.textContent = title;
    tagFragment.appendChild(tagLi);
  });
  tagArea.querySelector(`.comiclist`).appendChild(tagFragment);
};

const renderTags = async (tagObjs) => {
  tagObjs.forEach((tagObj) => {
    const tagArea = document.querySelector("#tagarea");
    const tagFragment = document.createDocumentFragment();
    tagObj.data.forEach((tag) => {
      const tagLi = document.createElement("li");
      tagLi.textContent = tag;
      tagFragment.appendChild(tagLi);
    });
    tagArea.querySelector(`.taglist.${tagObj.type}s`).appendChild(tagFragment);
  });
};

window.onload = async () => {
  allComicsListings = await getAllComicsListings();
  const tagObjs = [
    { type: "genre", data: allComicsListings.genres },
    { type: "tag", data: allComicsListings.tags },
    { type: "update", data: allComicsListings.updates },
  ];

  renderComicTitles(allComicsListings.titles);
  renderTags(tagObjs);
};
