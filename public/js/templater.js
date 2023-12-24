const selectedComic = document.createElement("template");
selectedComic.innerHTML = `
  <div>
    <h4 class="loader comic-title" data-templater></h4>
    <dl class="dropzones">
      <dt>Genres:</dt>
      <div class="loader taglister dropzone" data-zone="genres" data-receive="lister" data-templater></div>
      <div class="taglister" data-templater></div>
      <dt>Tags:</dt>
      <div class="loader taglister dropzone" data-zone="tags" data-templater></div>
      <div class="taglister" data-templater></div>
      <dt>Updates/Status:</dt>
      <dd class="loader category-updates" data-templater></dd>
    </dl>
  </div>
`;

let templates = { selectedComic };

const templater = (templatename, content, classnames) => {
  const tmpl =
    templates[templatename].content.firstElementChild.cloneNode(true);
  if (content) {
    content = Array.isArray(content) ? content : [content];
    tmpl.querySelectorAll("[data-templater]").forEach((tmplnode, index) => {
      if (typeof content[index] === "string") {
        tmplnode.textContent = content[index];
      } else {
        tmplnode.replaceChildren(content[index]);
      }
    });
  }
  if (classnames) {
    tmpl.classList.add(classnames);
  }

  return tmpl;
};


export { templater };
