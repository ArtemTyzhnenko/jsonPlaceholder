const APP = (function () {

  const myStore = {
    state: {
      currentRoute: 'posts',
      posts: [],
      user: [],
      comments: [],
      currentPage: 1,
      idOfUser: 1,
      postId: 1
    },
    updateStore(path, userId, target, postId) {
      this.state.currentRoute = path;
      this.state.currentPage = target;
      this.state.idOfUser = userId;
      this.state.postId = postId;
      render();
    }
  };

  const goToRoute = function (path, userId, target, postId) {
    myStore.updateStore(path, userId, target, postId);
  }.bind(this);

  const render = function () {
    const route = ROUTES.find(item => item.path === myStore.state.currentRoute);
    route.callBack();
  };

  const getInitialData = function () {
    return Promise.all([API.takePosts(), API.takeComments(), API.takeUsers()])
  };

  const init = function () {
    getInitialData().then(() => goToRoute('posts', 1, 1, 1))
  };

  const API = {
    takePosts: () =>
      fetch(`https://jsonplaceholder.typicode.com/posts`)
        .then(res => res.json())
        .then(data => {
          myStore.state.posts = data;
        })
    ,

    takeUsers: () => fetch(`https://jsonplaceholder.typicode.com/users`)
      .then(res => res.json())
      .then(data => {
        myStore.state.user = data;
      }),

    takeComments: () => fetch(`https://jsonplaceholder.typicode.com/comments`)
      .then(res => res.json())
      .then(data => {
        myStore.state.comments = data;
      })
  };

  const checkChanges = {
    checkChengsPosts: () => {

      return fetch(`https://jsonplaceholder.typicode.com/posts`)
        .then(res => res.json())
        .then(data => {
          if (myStore.state.posts.length !== data.length) {
            myStore.state.posts = data;
            render()
          } else {
            document.getElementsByClassName('pre-loader')[0].remove();
            console.log('GG')
          }
        })
    },
    checkChengsUsers: () => {
      return fetch(`https://jsonplaceholder.typicode.com/users`)
        .then(res => res.json())
        .then(data => {
          if (myStore.state.user.length !== data.length) {
            myStore.state.user = data;
            render()
          } else {
            document.getElementsByClassName('pre-loader')[0].remove();
            console.log('GG')
          }
        })
    },
    checkChengsComments: () => {
      return fetch(`https://jsonplaceholder.typicode.com/comments`)
        .then(res => res.json())
        .then(data => {
          if (myStore.state.comments.length !== data.length) {
            myStore.state.comments = data;
            render()
          } else {
            document.getElementsByClassName('pre-loader')[0].remove();
            console.log('GG')
          }
        })
    },
  };

  const view = {
    viewUser() {
      let parent = document.getElementsByClassName('posts-list')[0];

      let currentUser = myStore.state.user.find(item => item.id === myStore.state.idOfUser);

      const userList =
        `<div class="pre-loader">
          <img src="./images/Double%20Ring.gif" alt="">
        </div>
        <div class="user-list-info">
        <h1>Information about the author</h1>
          <h4 class="user-name">${currentUser.name}</h4>
          <button onclick="APP.goToRoute('posts', '', ${myStore.state.currentPage} )" class="close-button">X</button>
          <ul class="user-contacts">
              <li>Email: ${currentUser.email}</li>
              <li>Phone: ${currentUser.phone}</li>
              <li>Website: ${currentUser.website}</li>
              <li>Company: ${currentUser.company.name}</li>
          </ul>
      </div>`;
      parent.innerHTML = userList;
      checkChanges.checkChengsUsers();
    },
    viewPosts() {
      let parent = document.getElementsByClassName('posts-list')[0];
      const list = myStore.state.posts.map((item, i) => (
        `
         <li class="post">
            <button onclick="APP.goToRoute('user', ${item.userId}, ${myStore.state.currentPage},${item.id})" class='user' >
                ${myStore.state.user.find(elem => elem.id === item.userId).name}
            </button>
            <div class="post-blog">
              <h3 class="title-of-post">${item.title}</h3>
              <p class="body-of-post">${item.body}</p>
            </div>
            <button onclick="APP.goToRoute('comments', ${item.userId}, ${myStore.state.currentPage}, ${item.id}) " class='comments-button' >Comments</button>
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

      parent.innerHTML = `
        <div class="pre-loader">
          <img src="./images/Double%20Ring.gif" alt="">
        </div>
        <nav aria-label="Page navigation example">
          <ul class="pagination-top">
       <li class="page-item">
        <button>Previous</button>
      </li>
       ${paginationOnPage.join('')}
      <li class="page-item">
        <button>Next</button>
      </li>
    </ul>
  </nav>
        <ul class="list"><h1>Posts</h1>${renderingPosts.join('')}</ul>

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
      let getEventTarget = (e) => {
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

        goToRoute('posts', '', target);
      };
      document.getElementsByClassName('pagination-bottom')[0]
        .addEventListener('click', getEventTarget);
      document.getElementsByClassName('pagination-top')[0]
        .addEventListener('click', getEventTarget);
      checkChanges.checkChengsPosts();
    },
    viewComments() {
      let postId = myStore.state.postId;
      let comments = document.getElementsByClassName('comments')[postId - 1 - (myStore.state.currentPage * 20 - 20)];
      if (comments.style.display === 'block') {
        comments.style.display = 'none';
      } else {
        comments.style.display = 'block';
      }
      const listOfComments = myStore.state.comments.map((item) => {
        if (item.postId === postId)

          return `<li class="comment-block">
          <h4 class="title-of-comment">${item.name}</h4>
          <p class="body-of-comment">${item.body}</p>
        </li>`
      }).join('');

      comments.innerHTML = `
        <div class="pre-loader">
          <img src="./images/Double%20Ring.gif" alt="">
        </div>
        ${listOfComments}`;
      checkChanges.checkChengsComments();
    }
  };

  const ROUTES = [
    {
      path: 'user', callBack: function () {
      return view.viewUser()
    }
    },

    {
      path: 'posts', callBack: function () {
      return view.viewPosts()
    }
    },

    {
      path: 'comments', callBack: function () {
      return view.viewComments()
    }
    },

  ];

  return {init, goToRoute}
}());

APP.init();
