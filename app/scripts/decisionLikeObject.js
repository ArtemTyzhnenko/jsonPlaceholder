const APP = {
  myStore: {
    state: {
      currentRoute: 'posts',
      commentsOpened: false,

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
      APP.render();
    }
  },

  API: {
    takePosts: function () {
      return fetch(`https://jsonplaceholder.typicode.com/posts`)
        .then(res => res.json())
        .then(data => {
          APP.myStore.state.posts = data;
        })
    },

    takeUsers: () => fetch(`https://jsonplaceholder.typicode.com/users`)
      .then(res => res.json())
      .then(data => {
        APP.myStore.state.user = data;
      }),

    takeComments: () => fetch(`https://jsonplaceholder.typicode.com/comments`)
      .then(res => res.json())
      .then(data => {
        APP.myStore.state.comments = data;
      })
  },

  ROUTES: [
    {
      path: 'user', callBack: function () {
      return this.view.viewUser()
    }
    },
    {
      path: 'posts', callBack: function () {
      return this.view.viewPosts()
    }
    },
    {
      path: 'comments', callBack: function () {
      return this.view.viewComments()
    }
    }
  ],

  view: {
    viewUser() {
      if (!APP.myStore.state.user.length) {
        APP.getInitialData();
      }
      let parent = document.getElementsByClassName('posts-list')[0];
      let currentUser = APP.myStore.state.user.find(item => item.id === APP.myStore.state.idOfUser);
      const userList =
        `<div class="pre-loader">
          <img src="./images/Double%20Ring.gif" alt="">
        </div>
        <div class="user-list-info">
        <h1>Information about the author</h1>
          <h4 class="user-name">${currentUser.name}</h4>
          <button onclick="APP.goToRoute('posts', '', ${APP.myStore.state.currentPage})" class="close-button">X</button>
          <ul class="user-contacts">
              <li>Email: ${currentUser.email}</li>
              <li>Phone: ${currentUser.phone}</li>
              <li>Website: ${currentUser.website}</li>
              <li>Company: ${currentUser.company.name}</li>
          </ul>
      </div>`;
      parent.innerHTML = userList;
      APP.checkChengs.checkChengsUsers();
    },
    viewPosts() {
      let perent = document.getElementsByClassName('posts-list')[0];

      const list = APP.myStore.state.posts.map((item, i) => (
        `
         <li class="post">
            <button onclick="APP.goToRoute('user', ${item.userId}, ${APP.myStore.state.currentPage},${item.id})" class='user' >
                ${APP.myStore.state.user.find(elem => elem.id === item.userId).name}
            </button>
            <div class="post-blog">
              <h3 class="title-of-post">${item.title}</h3>
              <p class="body-of-post">${item.body}</p>
            </div>
            <button onclick="APP.goToRoute('comments',${item.userId}, APP.myStore.state.currentPage,${item.id})" class='comments-button' >Comments</button>
            <ul class='comments' ></ul>
        </li>
      `));
      let renderingPosts = [];
      for (let i = APP.myStore.state.currentPage * 20 - 20; i < APP.myStore.state.currentPage * 20; i++) {
        renderingPosts.push(list[i])
      }


      const numberOfPages = APP.myStore.state.posts.length/20;
      const pagination = [];
      for(let i = 1; i <= numberOfPages; i++){
        pagination.push(
          `<li class="page-item">
            <button>${i}</button>
           </li>`)
      }

      perent.innerHTML = `<div class="pre-loader">
          <img src="./images/Double%20Ring.gif" alt="">
        </div>

        <nav aria-label="Page navigation example">
          <ul class="pagination-top">
       <li class="page-item">
        <button>Previous</button>
      </li>
      ${pagination.join('')}
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
     ${pagination.join('')}
      <li class="page-item">
        <button>Next</button>
      </li>
    </ul>
  </nav>`;

      let getEventTarget = (e) => {
        e = e || window.event;
        let target = e.target.innerHTML || e.srcElement;

        if (APP.myStore.state.currentPage < 5 && target === 'Next') {
          target = ++APP.myStore.state.currentPage;
        } else if (target === 'Next') {
          target = APP.myStore.state.currentPage;
        } else if (APP.myStore.state.currentPage > 1 && target === 'Previous') {
          target = --APP.myStore.state.currentPage;
        } else if (target === 'Previous') {
          target = APP.myStore.state.currentPage;
        }
        APP.goToRoute('posts', '', target);
      };
      document.getElementsByClassName('pagination-bottom')[0]
        .addEventListener('click', getEventTarget);
      document.getElementsByClassName('pagination-top')[0]
        .addEventListener('click', getEventTarget);
      APP.checkChengs.checkChengsPosts();
    },
    viewComments() {
      let postId = APP.myStore.state.postId;
      let comments = document.getElementsByClassName('comments')[postId - 1 - (APP.myStore.state.currentPage * 20 - 20)];
      if (comments.style.display === 'block') {
        comments.style.display = 'none';
      } else {
        comments.style.display = 'block';
      }
      const listOfComments = APP.myStore.state.comments.map((item) => {
        if (item.postId === postId)

          return `<li class="comment-block">
          <h4 class="title-of-comment">${item.name}</h4>
          <p class="body-of-comment">${item.body}</p>
        </li>`
      }).join('');


      comments.innerHTML = ` <div class="pre-loader">
          <img src="./images/Double%20Ring.gif" alt="">
        </div>${listOfComments}`;
      APP.checkChengs.checkChengsComments()
    }
  },

  checkChengs: {
    checkChengsPosts: () => {

      return fetch(`https://jsonplaceholder.typicode.com/posts`)
        .then(res => res.json())
        .then(data => {
          if (APP.myStore.state.posts.length !== data.length) {
            APP.myStore.state.posts = data;
            APP.render()
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
          if (APP.myStore.state.user.length !== data.length) {
            APP.myStore.state.user = data;
            APP.render()
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
          if (APP.myStore.state.comments.length !== data.length) {
            APP.myStore.state.comments = data;
            APP.render()
          } else {
            document.getElementsByClassName('pre-loader')[0].remove();
            console.log('GG')
          }
        })
    },
  },

  goToRoute: function (path, userId, target, postId) {
    this.myStore.updateStore(path, userId, target, postId);
  },

  render: function () {
    const route = this.ROUTES.find(item => item.path === this.myStore.state.currentRoute);
    route.callBack.call(this);
  },

  getInitialData: function () {
    return Promise.all([this.API.takePosts(), this.API.takeComments(), this.API.takeUsers()])
  },

  init: function () {
    APP.getInitialData().then(() => APP.goToRoute('posts', 1, 1, 1))
  }
};

setTimeout(APP.init, 2000);

















