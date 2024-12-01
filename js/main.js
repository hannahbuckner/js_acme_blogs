
function createElemWithText(tagName = "p", text = "", name = "") {
    const newElement = document.createElement(tagName);
    newElement.textContent = text;
    if(name !== "") newElement.classList.add(name);
    return newElement;
}

function createSelectOptions(data) {
    if(!data) return;
    const optionArray = [];
    data.forEach((user) => {
        let temp = document.createElement("option");
        temp.value = user.id;
        temp.textContent = user.name;
        optionArray.push(temp);
    })
    return optionArray;
}

function toggleCommentSection(postId) {
    if(!postId) return;
    const section = document.querySelector(`section[data-post-id='${postId}']`);
    if(section === null) return null;
    section.classList.toggle("hide");
    return section;
}

function toggleCommentButton(postId) {
    if(!postId) return;
    const button = document.querySelector(`button[data-post-id='${postId}']`);
    if(button === null) return null;
    button.textContent === "Show Comments" ? button.textContent = "Hide Comments" : 
    button.textContent = "Show Comments";
    return button;
}

function deleteChildElements(parentElement) {
    if(!parentElement || !(parentElement instanceof HTMLElement)) return;
    let child = parentElement.lastElementChild;
    while(child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}

function addButtonListeners() {
    const buttons = document.querySelectorAll("main button");
    
    if(buttons) {
        buttons.forEach((button) => {
            let postId = button.dataset.postId;
            if(postId) {
                button.addEventListener("click", function(e) {toggleComments(e, postId)}, false);
            }
        })
    }
    return buttons;
}

function removeButtonListeners() {
    const buttons = document.querySelectorAll("main button");

    if(buttons) {
        buttons.forEach((button) => {
            let postId = button.dataset.postId;
            if(postId) {
                button.removeEventListener("click", function(e) {toggleComments(e, postId)}, false);
            }
        })
    }
    return buttons;
}

function createComments(comments) {
    if(!comments) return;
    const fragment = document.createDocumentFragment();

    comments.forEach((comment) => {
        const article = document.createElement("article");
        const h3 = createElemWithText('h3', comment.name);
        const paragraph = createElemWithText('p', comment.body);
        const paragraph2 = createElemWithText('p', `From: ${comment.email}`);
        article.append(h3, paragraph, paragraph2);
        fragment.append(article);
    })

    return fragment;
}

function populateSelectMenu(users) {
    if(!users) return;
    const selectMenu = document.getElementById("selectMenu");
    const options = createSelectOptions(users);
    options.forEach((option) => {
        selectMenu.append(option);
    })
    return selectMenu;
}

async function getUsers() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        const jsonUserData = await response.json();
        return jsonUserData;
    } catch(e) {
        return;
    }
}

async function getUserPosts(userId) {
    if(!userId) return;
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const jsonPostData = await response.json();
        const posts = [];
        jsonPostData.forEach(post => {
            if(post.userId === userId) posts.push(post);
        })
        return posts;
    } catch(e) {
        return;
    }
}

async function getUser(userId) {
    if(!userId) return;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users?id=${userId}`);
        const jsonUserData = await response.json();
        return jsonUserData[0];
    } catch(e) {
        return;
    }
}

async function getPostComments(postId) {
    if(!postId) return;
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/comments")
        const jsonCommentData = await response.json();
        const comments = [];
        jsonCommentData.forEach(comment => {
            if(comment.postId === postId) comments.push(comment);
        })
        return comments;
    } catch(e) {
        return;
    }
}

async function displayComments(postId) {
    if(!postId) return;
    const section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add("comments");
    section.classList.add("hide");
    const comments = await getPostComments(postId);
    const fragment = await createComments(comments);
    section.append(fragment);
    return section;
}

async function createPosts(posts) {
    if(!posts) return;
    const fragment = document.createDocumentFragment();
    for(let i = 0; i < posts.length; i++) {
        const article = document.createElement("article");
        const h2 = createElemWithText('h2', posts[i].title);
        const p = createElemWithText('p', posts[i].body);
        const p2 = createElemWithText('p', `Post ID: ${posts[i].id}`);
        const author = await getUser(posts[i].userId);
        const p3 = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const p4 = createElemWithText('p', author.company.catchPhrase);
        const button = createElemWithText('button', "Show Comments");
        button.dataset.postId = posts[i].id;
        article.append(h2, p, p2, p3, p4, button);
        const section = await displayComments(posts[i].id);
        article.append(section);
        fragment.append(article);
    }
    return fragment;
}

async function displayPosts(posts) {
    const main = document.querySelector("main");
    let element;
    if(posts) {
        element = await createPosts(posts);
    }
    if(!posts) {
        element = createElemWithText('p', "Select an Employee to display their posts.");
        element.classList.add("default-text");
    }
    main.append(element);
    return element;
}

function toggleComments(e, postId) {
    if(!e || !postId) return;
    e.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
}

async function refreshPosts(posts) {
    if(!posts) return;
    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector("main"));
    const fragment = await displayPosts(posts);
    const addButtons = addButtonListeners();
    return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(e) {
    if(!e) return;
    const userId = e?.target?.value || 1;
    const posts = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(posts);
    return [userId, posts, refreshPostsArray];
}

async function initPage() {
    const users = await getUsers();
    const select = populateSelectMenu(users);
    return [users, select];
}

async function initApp() {
    await initPage();
    const select = document.getElementById("selectMenu");
    select.addEventListener("change", selectMenuChangeEventHandler);
}

document.addEventListener("DOMContentLoaded", initApp);