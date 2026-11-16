(function () {
  'use strict';

  var TOKEN_KEY = 'votingToken';
  var state = { user: null, candidates: [] };

  var $ = function (id) { return document.getElementById(id); };
  var views = ['auth', 'vote', 'results', 'admin', 'account'];

  /* ---------- helpers ---------- */
  var toastTimer;
  function toast(msg, isError) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast' + (isError ? ' error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add('hidden'); }, 3500);
  }

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  function setToken(t) {
    try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage unavailable */ }
  }

  function api(method, url, body) {
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch(url, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok) {
            var err = new Error(data.error || data.message || 'Request failed');
            err.status = res.status;
            throw err;
          }
          return data;
        });
      });
  }

  function formData(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) { o[k] = typeof v === 'string' ? v.trim() : v; });
    return o;
  }

  function el(tag, props, children) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'text') e.textContent = props[k];
      else if (k === 'class') e.className = props[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), props[k]);
      else e.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }

  function validAadhar(v) { return /^\d{12}$/.test(v); }

  /* ---------- navigation ---------- */
  function show(view) {
    views.forEach(function (v) { $('view-' + v).classList.toggle('hidden', v !== view); });
    document.querySelectorAll('#nav button[data-view]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === view);
    });
    if (view === 'vote') loadCandidates();
    if (view === 'results') loadResults();
    if (view === 'admin') loadAdminList();
    if (view === 'account') renderProfile();
  }

  function logout() {
    setToken(null);
    state.user = null;
    $('nav').classList.add('hidden');
    show('auth');
  }

  function enterApp() {
    return api('GET', '/user/profile').then(function (d) {
      state.user = d.user;
      $('nav').classList.remove('hidden');
      $('navAdmin').classList.toggle('hidden', state.user.role !== 'admin');
      show(state.user.role === 'admin' ? 'admin' : 'vote');
    }).catch(function () { logout(); });
  }

  /* ---------- auth ---------- */
  $('tabLogin').addEventListener('click', function () { switchTab(true); });
  $('tabSignup').addEventListener('click', function () { switchTab(false); });
  function switchTab(login) {
    $('loginForm').classList.toggle('hidden', !login);
    $('signupForm').classList.toggle('hidden', login);
    $('tabLogin').classList.toggle('active', login);
    $('tabSignup').classList.toggle('active', !login);
  }

  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = formData(e.target);
    if (!validAadhar(d.aadharCardNumber)) return toast('Aadhar number must be exactly 12 digits', true);
    if (!d.password) return toast('Enter your password', true);
    api('POST', '/user/login', { aadharCardNumber: Number(d.aadharCardNumber), password: d.password })
      .then(function (r) { setToken(r.token); e.target.reset(); return enterApp(); })
      .catch(function (err) { toast(err.message, true); });
  });

  $('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = formData(e.target);
    if (!d.name || !d.address) return toast('Name and address are required', true);
    if (!(Number(d.age) >= 1)) return toast('Enter a valid age', true);
    if (!validAadhar(d.aadharCardNumber)) return toast('Aadhar number must be exactly 12 digits', true);
    if (!d.password || d.password.length < 4) return toast('Password must be at least 4 characters', true);
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) return toast('Enter a valid email', true);
    d.age = Number(d.age);
    d.aadharCardNumber = Number(d.aadharCardNumber);
    api('POST', '/user/signup', d)
      .then(function (r) { setToken(r.token); e.target.reset(); toast('Account created'); return enterApp(); })
      .catch(function (err) { toast(err.message, true); });
  });

  $('logoutBtn').addEventListener('click', logout);
  $('nav').addEventListener('click', function (e) {
    var v = e.target.dataset && e.target.dataset.view;
    if (v) show(v);
  });

  /* ---------- vote ---------- */
  function loadCandidates() {
    var voted = state.user && state.user.isVoted;
    var isAdmin = state.user && state.user.role === 'admin';
    $('voteStatus').textContent = isAdmin ? 'Admins cannot vote.' :
      voted ? 'You have already voted. Thank you!' : 'Choose one candidate. You can vote only once.';
    api('GET', '/candidate').then(function (list) {
      var box = $('candidateList');
      box.textContent = '';
      if (!list.length) { box.appendChild(el('p', { class: 'muted', text: 'No candidates yet.' })); return; }
      list.forEach(function (c) {
        var btn = el('button', { text: 'Vote' });
        btn.disabled = !!voted || isAdmin;
        btn.addEventListener('click', function () { castVote(c); });
        box.appendChild(el('div', { class: 'cand' }, [
          el('h3', { text: c.name }),
          el('div', { class: 'muted', text: 'Party: ' + c.party }),
          el('div', { class: 'muted', text: 'Age: ' + c.age }),
          btn
        ]));
      });
    }).catch(function (err) { toast(err.message, true); });
  }

  function castVote(c) {
    if (!window.confirm('Vote for ' + c.name + ' (' + c.party + ')? This cannot be undone.')) return;
    api('POST', '/candidate/vote/' + c._id)
      .then(function () { state.user.isVoted = true; toast('Vote recorded successfully'); show('results'); })
      .catch(function (err) {
        toast(err.message, true);
        if (err.status === 400) { state.user.isVoted = true; loadCandidates(); }
      });
  }

  /* ---------- results ---------- */
  function loadResults() {
    api('GET', '/candidate/vote/count').then(function (rows) {
      var box = $('resultsList');
      box.textContent = '';
      if (!rows.length) { box.appendChild(el('p', { class: 'muted', text: 'No candidates yet.' })); return; }
      var total = rows.reduce(function (s, r) { return s + r.count; }, 0);
      rows.forEach(function (r) {
        var pct = total ? Math.round((r.count / total) * 100) : 0;
        var fill = el('span');
        fill.style.width = pct + '%';
        box.appendChild(el('div', { class: 'result' }, [
          el('div', { class: 'meta' }, [
            el('span', { text: (r.name ? r.name + ' - ' : '') + r.party }),
            el('span', { text: r.count + ' vote' + (r.count === 1 ? '' : 's') + ' (' + pct + '%)' })
          ]),
          el('div', { class: 'bar' }, [fill])
        ]));
      });
      box.appendChild(el('p', { class: 'muted', text: 'Total votes: ' + total }));
    }).catch(function (err) { toast(err.message, true); });
  }
  $('refreshResults').addEventListener('click', loadResults);

  /* ---------- admin ---------- */
  function resetCandForm() {
    var f = $('candidateForm');
    f.reset();
    f.elements.id.value = '';
    $('candFormTitle').textContent = 'Add candidate';
    $('candSubmit').textContent = 'Add candidate';
    $('candCancel').classList.add('hidden');
  }
  $('candCancel').addEventListener('click', resetCandForm);

  $('candidateForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = formData(e.target);
    if (!d.name || !d.party) return toast('Name and party are required', true);
    if (!(Number(d.age) >= 1)) return toast('Enter a valid age', true);
    var body = { name: d.name, party: d.party, age: Number(d.age) };
    var req = d.id ? api('PUT', '/candidate/' + d.id, body) : api('POST', '/candidate', body);
    req.then(function () {
      toast(d.id ? 'Candidate updated' : 'Candidate added');
      resetCandForm();
      loadAdminList();
    }).catch(function (err) { toast(err.message, true); });
  });

  function loadAdminList() {
    api('GET', '/candidate').then(function (list) {
      var box = $('adminList');
      box.textContent = '';
      if (!list.length) { box.appendChild(el('p', { class: 'muted', text: 'No candidates yet.' })); return; }
      list.forEach(function (c) {
        var edit = el('button', { class: 'ghost', text: 'Edit' });
        edit.addEventListener('click', function () {
          var f = $('candidateForm');
          f.elements.id.value = c._id;
          f.elements.name.value = c.name;
          f.elements.party.value = c.party;
          f.elements.age.value = c.age;
          $('candFormTitle').textContent = 'Edit candidate';
          $('candSubmit').textContent = 'Save changes';
          $('candCancel').classList.remove('hidden');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        var del = el('button', { class: 'danger', text: 'Delete' });
        del.addEventListener('click', function () {
          if (!window.confirm('Delete ' + c.name + '? Their votes will be lost.')) return;
          api('DELETE', '/candidate/' + c._id)
            .then(function () { toast('Candidate deleted'); loadAdminList(); })
            .catch(function (err) { toast(err.message, true); });
        });
        box.appendChild(el('div', { class: 'admin-item' }, [
          el('div', {}, [
            el('strong', { text: c.name }),
            el('div', { class: 'muted', text: c.party + ' | Age ' + c.age + ' | ' + c.voteCount + ' votes' })
          ]),
          el('div', { class: 'btns' }, [edit, del])
        ]));
      });
    }).catch(function (err) { toast(err.message, true); });
  }

  /* ---------- account ---------- */
  function renderProfile() {
    var u = state.user;
    var box = $('profileBox');
    box.textContent = '';
    if (!u) return;
    [['Name', u.name], ['Age', u.age], ['Email', u.email || '-'], ['Mobile', u.mobile || '-'],
     ['Address', u.address], ['Aadhar', u.aadharCardNumber], ['Role', u.role],
     ['Voted', u.role === 'admin' ? 'n/a' : (u.isVoted ? 'Yes' : 'No')]
    ].forEach(function (p) {
      box.appendChild(el('dt', { text: p[0] }));
      box.appendChild(el('dd', { text: String(p[1]) }));
    });
  }

  $('passwordForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = formData(e.target);
    if (!d.currentPassword || !d.newPassword) return toast('Fill in both passwords', true);
    if (d.newPassword.length < 4) return toast('New password must be at least 4 characters', true);
    api('PUT', '/user/profile/password', d)
      .then(function () { e.target.reset(); toast('Password updated'); })
      .catch(function (err) { toast(err.message, true); });
  });

  /* ---------- start ---------- */
  if (getToken()) enterApp(); else show('auth');
})();
