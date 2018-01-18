let myStore = {
  state: {
    posts: [],
    user: [],
    comments: [],
    currentPage: 1
  },

  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
  },

  publish(type) {
    this.listeners.find((item) => item.type === type).render()
  },

  updateStore(payload) {
    switch (payload.type) {
      case 'POSTS' :
        this.state.posts = payload.data;
        this.publish('GetPosts');
        break;
      case 'USER':
        this.state.user = payload.data;
        this.publish('ShowUserInfo');
        break;
      case 'COMMENTS':
        this.state.comments = payload.data;
        this.publish('ShowComments');
        break;

      case 'PAGINATION':
        this.state.currentPage = payload.currentPage;
        this.publish('Pagination');
        break;
    }
  }

};

const API = {
  takePosts: () => fetch(`https://jsonplaceholder.typicode.com/posts`)
    .then(res => res.json()),

  takeUsers: (id) => fetch(`https://jsonplaceholder.typicode.com/users?id=${id}`)
    .then(res => res.json()),

  takeComments: (id) => fetch(`https://jsonplaceholder.typicode.com/comments?postId=${id}`)
    .then(res => res.json())
};

const posts = {

  viewPosts: () => {
    let perent = document.getElementsByClassName('posts-list')[0];
    const list = myStore.state.posts.map((item, i) => (
      `
         <li class="post">
            <button onclick="Actions.actionUser(${item.userId})" class='user' >USER</button>
            <div class="post-blog">
              <h3 class="title-of-post">${item.title}</h3>
              <p class="body-of-post">${item.body}</p>
            </div>
            <button onclick="Actions.actionComments(${item.id})" class='comments-button' >Comments</button>
            <ul class='comments' ></ul>
        </li>
      `));
    let renderingPosts = [];
    for (let i = myStore.state.currentPage * 20 - 20; i < myStore.state.currentPage * 20; i++) {
      renderingPosts.push(list[i])
    }

    const numberOfPages = myStore.state.posts.length / 20;
    const paginationOnPage = [];
    for (let i = 1; i <= numberOfPages; i++) {
      paginationOnPage.push(
        `<li class="page-item">
            <button>${i}</button>
           </li>`)
    }

    perent.innerHTML = `<ul class="list"><h1>Posts</h1>${renderingPosts.join('')}</ul>

<nav aria-label="Page navigation example">
    <ul class="pagination-bottom">
      <li class="page-item">
        <button>Previous</button>
      </li>
      ${paginationOnPage.join('')}
      <li class="page-item">
        <button>Next</button>
      </li>
    </ul>
  </nav>`;
    document.getElementsByClassName('pagination-bottom')[0]
      .addEventListener('click', pagination.getEventTarget);
  }
};

const pagination = {

  getEventTarget: (e) => {
    e = e || window.event;
    let target = e.target.innerHTML || e.srcElement;

    if (myStore.state.currentPage < 5 && target === 'Next') {
      target = ++myStore.state.currentPage;
    } else if (target === 'Next') {
      target = myStore.state.currentPage;
    } else if (myStore.state.currentPage > 1 && target === 'Previous') {
      target = --myStore.state.currentPage;
    } else if (target === 'Previous') {
      target = myStore.state.currentPage;
    }
    Actions.actionPagination(target);
  }
};

const comments = {
  viewComments: () => {
    const {postId} = myStore.state.comments[0];
    let comments = document.getElementsByClassName('comments')[postId - 1 - (myStore.state.currentPage * 20 - 20)];
    if (comments.style.display === 'block') {
      comments.style.display = 'none';
    } else {
      comments.style.display = 'block';
    }
    const listOfComments = myStore.state.comments.map((item) =>
      `<li class="comment-block">
          <h4 class="title-of-comment">${item.name}</h4>
          <p class="body-of-comment">${item.body}</p>
        </li>

      `).join('');

    comments.innerHTML = listOfComments;
  },
};

const user = {
  viewUser: () => {

    let perent = document.getElementsByClassName('posts-list')[0];
    const userList = myStore.state.user.map((item) =>
      `<div class="user-list-info">
          <h1>Information about the author</h1>
          <h4 class="user-name">${item.name}</h4>
          <button onclick="posts.viewPosts()" class="close-button">X</button>

          <ul class="user-contacts">
              <li>Email: ${item.email}</li>
              <li>Phone: ${item.phone}</li>
              <li>Website: ${item.website}</li>
              <li>Company: ${item.company.name}</li>
          </ul>
      </div>`
    ).join('');
    perent.innerHTML = userList;
  }
};

myStore.subscribe({type: 'GetPosts', render: posts.viewPosts});
myStore.subscribe({type: 'ShowComments', render: comments.viewComments});
myStore.subscribe({type: 'ShowUserInfo', render: user.viewUser});
myStore.subscribe({type: 'Pagination', render: posts.viewPosts});

const Actions = {
  actionPagination(page) {
    myStore.updateStore({type: 'PAGINATION', currentPage: page})
  },

  actionPosts() {
    API.takePosts()
      .then((data) => myStore.updateStore({type: 'POSTS', data: data}))
  },

  actionUser(userId) {
    API.takeUsers(userId)
      .then((data) => myStore.updateStore({type: 'USER', data: data}));
  },

  actionComments(id) {
    API.takeComments(id)
      .then((data) => myStore.updateStore({type: 'COMMENTS', data: data}))
      .catch(err => console.log('Error on fetching comments for a post: ', err));
  }

};

Actions.actionPosts();
