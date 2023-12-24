import {
  handleDragStart,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDragEnd,
  handleDrop,
} from './dragops.js';
import { templater } from './templater.js';

let allComicsListings = {};
let selectedComicEntry = {};
let draggedElem = {};

const initComics = async () => {
  allComicsListings = await getAllComicsListings();
  renderComics(allComicsListings.names);
  document
    .querySelector('#comicEditor')
    .addEventListener('submit', handleSubmission);
  // document.querySelector('main').addEventListener('dragenter', handleDragEnter);
  document.querySelector('main').addEventListener('dragover', handleDragOver);
  document.querySelector('main').addEventListener('drop', handleMainDrop);
};

const resetAdmin = () => {
  const resetHTML = `<div id="selectedComicLoadTarget">
  <h2>${selectedComicEntry.name} was successfully updated.</h2>
            <p>Click on a comic’s name to load its metadata.</p>
            <p>Drag and drop tags to make changes.</p>
  </div>`;
  document.querySelector('#selectedComicLoadTarget').innerHTML = resetHTML;
  document.querySelector('#comicEntrySubmit').textContent = 'No changes';
  selectedComicEntry = {};
};

const handleMainDrop = (e) => {
  const newtag = e.dataTransfer.getData('text/plain');
  const eventPath = e.composedPath().filter((element) => element.matches);
  const inDropZone = eventPath.some((element) => element.matches('.dropzone'));
  if (inDropZone) {
    handleDropAdd(e);
  } else {
    handleDropRemove(e);
  }
  dropCleanup(e);
};

const handleDropAdd = (e) => {
  const newtag = e.dataTransfer.getData('text/plain');
  const eventPath = e.composedPath().filter((element) => element.matches);
  const theDropZone = eventPath.find((element) => element.matches('.dropzone'));
  const tagCategory = theDropZone.dataset.zone; // droptarget
  console.log(tagCategory, newtag);
  if (
    allComicsListings[tagCategory]?.includes(newtag) &&
    !selectedComicEntry[tagCategory]?.includes(newtag)
  ) {
    selectedComicEntry[tagCategory] = selectedComicEntry[tagCategory] || [];
    selectedComicEntry[tagCategory].push(newtag);
    enableSubmitOps();
    loadSelectedComic(selectedComicEntry);
  }
};

const handleDropRemove = (e) => {
  const tagCategory = draggedElem.dataset.type;
  const destroytag = draggedElem.dataset.value;
  console.log(tagCategory, destroytag);
  if (
    draggedElem.destroying &&
    selectedComicEntry[tagCategory]?.includes(destroytag)
  ) {
    const destroyIndex = selectedComicEntry[tagCategory].findIndex(
      (tag) => tag === destroytag
    );
    selectedComicEntry[tagCategory].splice(destroyIndex, 1);
    enableSubmitOps();
    loadSelectedComic(selectedComicEntry);
  }
};

const dropCleanup = (e) => {
  handleDrop(e);
  document.querySelectorAll('.dropzone').forEach((dropzone) => {
    dropzone.classList.remove('dragover');
    dropzone.classList.remove('dragout');
  });
  draggedElem = {};
};

const enableSubmitOps = async () => {
  const submitBtn = document.querySelector('#comicEntrySubmit');
  submitBtn.textContent = `Submit changes to ${selectedComicEntry.name}`;
  submitBtn.disabled = false;
};

const pauseSubmitOps = async () => {
  const submitBtn = document.querySelector('#comicEntrySubmit');
  submitBtn.textContent = `Saving changes to ${selectedComicEntry.name}…`;
  submitBtn.disabled = true;
};

const handleSubmission = async (e) => {
  e.preventDefault();
  pauseSubmitOps();
  const comicFormData = new FormData();
  const response = await fetch('/edit', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(selectedComicEntry),
  });
  resetAdmin();
};

const getAllComicsListings = async () => {
  const endpoints = ['names', 'genres', 'tags', 'updates'];
  const comicListings = await Promise.all(
    endpoints.map(async (endpoint) => {
      const resp = await fetch('/' + endpoint);
      return resp.json();
    })
  );
  const allComicsListingsObj = Object.fromEntries(
    endpoints.map((endpoint, i) => [endpoint, comicListings[i]])
  );
  allComicsListings = allComicsListingsObj;
  return allComicsListingsObj;
};

const getComicEntry = async (comicID) => {
  const request = await fetch('/comics/' + comicID);
  const comicdata = await request.json();
  selectedComicEntry = comicdata;
  return comicdata;
};

const handleComicSelection = async (e) => {
  const foundComic = await getComicEntry(e.currentTarget.dataset.id);
  loadSelectedComic(foundComic);
};

const handleDragSetup = (e) => {
  draggedElem = e.currentTarget;
  handleDragStart(e);
};

const handleDragEntrance = (e) => {
  const targetZoneElem = e.currentTarget;
  const targetZone = targetZoneElem.dataset.zone;
  const tagValue = draggedElem.dataset.value;
  if (!selectedComicEntry[targetZone]?.includes(tagValue)) {
    targetZoneElem.classList.add('dragover');
  }
  draggedElem.destroying = false;
  draggedElem.classList.remove('destroy');
  handleDragEnter(e);
};

const handleDragExit = (e) => {
  const targetZoneElem = e.currentTarget;
  const targetZone = targetZoneElem.dataset.zone;
  const tagValue = draggedElem.dataset.value;
  if (selectedComicEntry[targetZone]?.includes(tagValue)) {
    targetZoneElem.classList.add('dragout');
    draggedElem.destroying = true;
    draggedElem.classList.add('destroy');
  }
  handleDragLeave(e);
};

const handleChangeUpdate = (e) => {
  const value = e.currentTarget.value;
  if (allComicsListings.updates.includes(value)) {
    selectedComicEntry.updates = [value];
    enableSubmitOps();
    loadSelectedComic(selectedComicEntry);
  }
};

const loadSelectedComic = async (comicEntry) => {
  const generateTagList = (tagData, tagType) => {
    const listFragment = document.createDocumentFragment();
    if (tagData) {
      tagData.forEach((tag) => {
        const tagElem = document.createElement('dd');
        tagElem.draggable = true;
        tagElem.textContent = tag;
        tagElem.dataset.value = tag;
        tagElem.dataset.type = tagType;
        tagElem.classList.add('listtag');
        tagElem.addEventListener('dragstart', handleDragSetup);
        // tagElem.addEventListener('dragend', handleDragCleanup);
        listFragment.appendChild(tagElem);
      });
    } else {
      const span = document.createElement('span');
      span.textContent = 'none';
      listFragment.appendChild(span);
    }
    return listFragment;
  };

  const usedGenres = generateTagList(comicEntry.genres, 'genres');

  const unusedGenres = generateTagList(
    comicEntry.genres
      ? allComicsListings.genres.filter(
          (genre) => !comicEntry.genres.includes(genre)
        )
      : allComicsListings.genres,
    'genres'
  );
  const usedTags = generateTagList(comicEntry.tags, 'tags');
  const unusedTags = generateTagList(
    comicEntry.tags
      ? allComicsListings.tags.filter((tag) => !comicEntry.tags.includes(tag))
      : allComicsListings.tags,
    'tags'
  );
  const updateSelector = document.createElement('select');
  const blankOption = document.createElement('option');
  blankOption.value = '';
  blankOption.textContent = '---';
  updateSelector.appendChild(blankOption);
  blankOption.selected = 'selected';
  allComicsListings.updates.forEach((update) => {
    const updateOption = document.createElement('option');
    updateOption.value = update;
    updateOption.textContent = update;
    if (comicEntry.updates?.includes(update)) {
      updateOption.selected = 'selected';
    }
    updateSelector.appendChild(updateOption);
  });
  updateSelector.addEventListener('change', handleChangeUpdate);

  const comicDOM = templater(
    'selectedComic',
    [
      comicEntry.name,
      usedGenres,
      unusedGenres,
      usedTags,
      unusedTags,
      updateSelector,
    ],
    comicEntry.id
  );
  comicDOM.querySelectorAll('.loader.dropzone').forEach((dropzone) => {
    dropzone.addEventListener('dragenter', handleDragEntrance);
    // dropzone.addEventListener("dragover", handleDragOver);
    dropzone.addEventListener('dragleave', handleDragExit);
    // dropzone.addEventListener("drop", handleDropRepop);
  });
  document.querySelector('#selectedComicLoadTarget').replaceChildren(comicDOM);
};

const renderComics = async (comicsNames) => {
  const sortedComics = comicsNames.sort((a, b) =>
    a.sortname.localeCompare(b.sortname)
  );
  const tagArea = document.querySelector('#comicarea');
  const tagFragment = document.createDocumentFragment();
  sortedComics.forEach((comic) => {
    const tagLi = document.createElement('li');
    const tagLiA = document.createElement('a');
    tagLiA.textContent = comic.title;
    tagLiA.dataset.id = comic.id;
    tagLiA.addEventListener('click', handleComicSelection);
    tagLi.appendChild(tagLiA);
    tagFragment.appendChild(tagLi);
  });
  tagArea.querySelector('.comiclist').appendChild(tagFragment);
};

window.onload = async () => {
  initComics(await getAllComicsListings());
};
