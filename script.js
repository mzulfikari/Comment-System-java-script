// * Global
const timer = 3000;
const MAX_CHARS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";

// * El Variable
const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedsEl = document.querySelector(".feedbacks");
const submitEl = document.querySelector(".submit-btn");
const hashtagListEl = document.querySelector(".hashtags");


const renderFeedbackItem = (feedback) => {
  const feedItem = `
    <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedback.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${feedback.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${feedback.company}</p>
                <p class="feedback__text">
                ${feedback.text}
                </p>
            </div>
            <p class="feedback__date">${
              feedback.daysAgo === 0 ? "NEW" : `${feedback.daysAgo}d`
            }</p>
        </li>
    `;
  feedsEl.insertAdjacentHTML("beforeend", feedItem);
};

const inputHandler = () => {
  const maxChars = MAX_CHARS;
  const CharsTyped = textareaEl.value.length;
  const charsLeft = maxChars - CharsTyped;
  // * show number of characters left
  counterEl.textContent = charsLeft;
};

textareaEl.addEventListener("input", inputHandler);

// * Form Component

const submitHandler = (event) => {
  event.preventDefault();
  const text = textareaEl.value;
  if (text.includes("#") && text.length >= 5) {
    showVisualIndicator("valid");
  } else {
    showVisualIndicator("invalid");
    textareaEl.focus();
    return;
  }
  const hashtag = text.split(" ").find((word) => word.includes("#"));
  const company = hashtag.substring(1);
  const badgeLetter = company.substring(0, 1).toUpperCase();
  const upvoteCount = 0;
  const daysAgo = 0;

  // * feedbacks
  const feed = {
    upvoteCount: upvoteCount,
    daysAgo: daysAgo,
    badgeLetter: badgeLetter,
    company: company,
    text: text,
  };
  renderFeedbackItem(feed);

  // * send feedback item to server
  fetch(`${BASE_API_URL}/feedbacks`, {
    method: "POST",
    body: JSON.stringify(feed),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Something went wrong");
        return;
      }
      console.log("Successful submitted");
    })
    .catch((error) => console.log(error));

  textareaEl.value = "";
  submitEl.blur();
  counterEl.textContent = MAX_CHARS;
};

const showVisualIndicator = (textCheck) => {
  const className = textCheck === "valid" ? "form--valid" : "form--invalid";
  formEl.classList.add(className);
  setTimeout(() => {
    formEl.classList.remove(className);
  }, timer);
};

formEl.addEventListener("submit", submitHandler);
// * End Submit Component

fetch(`${BASE_API_URL}/feedbacks`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    document.querySelector(".spinner").remove();
    data.feedbacks.forEach((feedItem) => renderFeedbackItem(feedItem));
  })
  .catch((error) => {
    feedsEl.textContent = `to fetch feedback items. Error message : ${error.message}`;
  });

const clickHandler = (event) => {
  const clickedEl = event.target;
  const upvoteEl = clickedEl.className.includes("upvote");
  if (upvoteEl) {
    const upvoteBtnEl = clickedEl.closest(".upvote");
    upvoteBtnEl.disabled = true;

    const upvoteCountEl = upvoteBtnEl.querySelector(".upvote__count");
    let upvoteCount = +upvoteBtnEl.textContent;
    upvoteCountEl.textContent = ++upvoteCount;
  } else {
    clickedEl.closest('.feedback').classList.toggle('feedback--expand');
  }
};

feedsEl.addEventListener("click", clickHandler);


const hashtagClickHandler = event => {
  const clickedEl = event.target;
  if (clickedEl.className === 'hashtags') return;
  const companyNameFromHashtag = clickedEl.textContent.substring(1).trim();

  feedsEl.childNodes.forEach(childNode => {
    if (childNode.nodeType === 3) return;

    const companyNameFromFeedbackItem = childNode.
      querySelector('.feedback__company')
      .textContent.toLowerCase().trim();
    
    if (companyNameFromHashtag.toLowerCase().trim() !== companyNameFromFeedbackItem)
    {
      childNode.remove();
    }
  })
};

hashtagListEl.addEventListener("click", hashtagClickHandler);