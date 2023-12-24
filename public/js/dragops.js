const handleDragStart = (e) => {
  e.dataTransfer.setData("text/plain", e.currentTarget.dataset.value);
  e.dataTransfer.effectAllowed = "copyMove";
};

const handleDragEnter = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  e.currentTarget.classList.remove("dragout");
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove("dragout");
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "none";
  e.currentTarget.classList.remove("dragover");
};

const handleDrop = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove("dragover");
  e.currentTarget.classList.remove("dragout");
};

const handleDragEnd = (e) => {
  e.preventDefault();
};

export { handleDragStart, handleDragEnter, handleDragOver, handleDragLeave, handleDragEnd, handleDrop };
